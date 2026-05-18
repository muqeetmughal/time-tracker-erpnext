import {
  closeActiveActivityRow,
  createActivityRow,
  createActivitySession,
  insertActivityTimeline,
  stopActivitySession,
  updateActivitySessionStatus,
} from "../db";
import { getConfig } from "../store";
import type {
  ActivitySessionRecord,
  TrackerStartPayload,
  TrackerStartResult,
  TrackerStatusResult,
  TrackerStopResult,
  TrackerUpdateActivityPayload,
  TrackerUpdateActivityResult,
} from "../types";
import { CamshotService } from "./camshot-service";
import { cleanupUploadedCaptureFiles } from "./capture-storage";
import { IdleDetectionService } from "./idle-detection-service";
import { InputTrackingService } from "./input-tracking-service";
import { ScreenshotService } from "./screenshot-service";
import { UploadQueueService } from "./upload-queue-service";

class ActivitySessionService {
  private activeSession: ActivitySessionRecord | null = null;
  private uploadQueue = new UploadQueueService();
  private screenshotService = new ScreenshotService(this.uploadQueue);
  private camshotService = new CamshotService(this.uploadQueue);
  private inputTrackingService = new InputTrackingService();
  private idleDetectionService = new IdleDetectionService();
  private autosaveTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;

  async start(payload: TrackerStartPayload): Promise<TrackerStartResult> {
    if (this.activeSession) {
      return {
        success: true,
        sessionId: this.activeSession.id,
        startedAt: this.activeSession.startTime,
        status: this.activeSession.status,
      };
    }

    if (!payload.project) {
      throw new Error("Please select a project first.");
    }

    const startedAt = new Date().toISOString();
    const sessionId = `session-${Date.now()}`;
    const config = getConfig();

    this.activeSession = createActivitySession({
      id: sessionId,
      projectId: payload.project,
      taskId: payload.taskId,
      description: payload.description,
      startTime: startedAt,
    });
    createActivityRow({
      sessionId,
      project: payload.project,
      description: payload.description,
      startTime: startedAt,
    });
    insertActivityTimeline({
      sessionId,
      type: "tracking_started",
      timestamp: startedAt,
    });

    this.screenshotService.start(sessionId, getConfig);
    this.camshotService.start(sessionId, getConfig);
    await this.inputTrackingService.start(sessionId, config);
    this.idleDetectionService.start(sessionId, config, {
      onIdleStarted: () => this.pauseForIdle(),
      onIdleEnded: () => this.resumeFromIdle(),
    });
    this.autosaveTimer = setInterval(() => {
      if (this.activeSession) {
        updateActivitySessionStatus(
          this.activeSession.id,
          this.activeSession.status,
        );
      }
    }, 60_000);
    this.cleanupTimer = setInterval(() => {
      void cleanupUploadedCaptureFiles().catch((error) => {
        console.warn("Uploaded media cleanup failed:", error);
      });
    }, 5 * 60_000);

    return {
      success: true,
      sessionId,
      startedAt,
      status: "active",
    };
  }

  async stop(): Promise<TrackerStopResult> {
    if (!this.activeSession) {
      throw new Error("No tracker session is currently running.");
    }

    const session = this.activeSession;
    const stoppedAt = new Date().toISOString();

    closeActiveActivityRow(session.id, stoppedAt);
    this.screenshotService.stop();
    this.camshotService.stop();
    this.inputTrackingService.stop();
    this.idleDetectionService.stop(session.id);

    if (this.autosaveTimer) {
      clearInterval(this.autosaveTimer);
      this.autosaveTimer = null;
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    void cleanupUploadedCaptureFiles().catch((error) => {
      console.warn("Uploaded media cleanup failed:", error);
    });

    insertActivityTimeline({
      sessionId: session.id,
      type: "tracking_stopped",
      timestamp: stoppedAt,
    });
    const stoppedSession = stopActivitySession(session.id, stoppedAt);
    this.activeSession = null;

    return {
      success: true,
      sessionId: stoppedSession.id,
      startedAt: stoppedSession.startTime,
      stoppedAt,
      durationSeconds: stoppedSession.duration,
      status: stoppedSession.status,
    };
  }

  updateActivity(
    payload: TrackerUpdateActivityPayload,
  ): TrackerUpdateActivityResult {
    if (!this.activeSession) {
      throw new Error("No tracker session is currently running.");
    }

    const description = payload.description.trim();

    if (!description) {
      throw new Error("Activity description is required.");
    }

    const startedAt = new Date().toISOString();
    const activityId = createActivityRow({
      sessionId: this.activeSession.id,
      project: this.activeSession.projectId,
      description,
      startTime: startedAt,
    });

    this.activeSession = {
      ...this.activeSession,
      description,
    };

    return {
      success: true,
      activityId,
      description,
      startedAt,
    };
  }

  getActiveSession() {
    return this.activeSession;
  }

  getStatus(): TrackerStatusResult {
    if (!this.activeSession) {
      return {
        isTracking: false,
        sessionId: "",
        project: "",
        description: "",
        startedAt: "",
        status: "",
      };
    }

    return {
      isTracking: true,
      sessionId: this.activeSession.id,
      project: this.activeSession.projectId,
      description: this.activeSession.description,
      startedAt: this.activeSession.startTime,
      status: this.activeSession.status,
    };
  }

  private pauseForIdle() {
    this.screenshotService.pause();
    this.camshotService.pause();
    this.inputTrackingService.pause();

    if (this.activeSession) {
      this.activeSession = {
        ...this.activeSession,
        status: "idle",
      };
    }
  }

  private resumeFromIdle() {
    const config = getConfig();

    if (!config.general.resumeTrackingAfterIdle) {
      return;
    }

    this.screenshotService.resume();
    this.camshotService.resume();
    this.inputTrackingService.resume();

    if (this.activeSession) {
      this.activeSession = {
        ...this.activeSession,
        status: "active",
      };
    }
  }
}

export const activitySessionService = new ActivitySessionService();
