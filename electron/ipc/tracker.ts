import { ipcMain } from "electron";
import type {
  TrackerStartPayload,
  TrackerStartResult,
  TrackerStopResult,
} from "../types";

type ActiveSession = {
  sessionId: string;
  project: string;
  description: string;
  startedAt: string;
};

let activeSession: ActiveSession | null = null;

export function registerTrackerHandlers() {
  ipcMain.handle(
    "tracker:start",
    async (_, payload: TrackerStartPayload): Promise<TrackerStartResult> => {
      if (activeSession) {
        return {
          success: true,
          sessionId: activeSession.sessionId,
          startedAt: activeSession.startedAt,
        };
      }

      if (!payload.project) {
        throw new Error("Please select a project first.");
      }

      const startedAt = new Date().toISOString();
      const sessionId = "session-" + Date.now();

      activeSession = {
        sessionId,
        project: payload.project,
        description: payload.description,
        startedAt,
      };

      console.log("Tracker Started:", activeSession);

      /**
       * TODO:
       * 1. Create local tracker session
       * 2. Call ERPNext start_session API
       * 3. Start screenshot interval
       * 4. Start activity interval
       * 5. Start heartbeat
       */

      return {
        success: true,
        sessionId,
        startedAt,
      };
    },
  );

  ipcMain.handle("tracker:stop", async (): Promise<TrackerStopResult> => {
    try {
      if (!activeSession) {
        throw new Error("No tracker session is currently running.");
      }

      const stoppedAt = new Date().toISOString();
      const durationSeconds = Math.max(
        0,
        Math.floor(
          (new Date(stoppedAt).getTime() -
            new Date(activeSession.startedAt).getTime()) /
            1000,
        ),
      );

      const stoppedSession = activeSession;
      activeSession = null;

      console.log("Tracker Stopped:", {
        ...stoppedSession,
        stoppedAt,
        durationSeconds,
      });

      /**
       * TODO:
       * 1. Stop intervals
       * 2. Upload pending screenshots
       * 3. Upload activity logs
       * 4. Call ERPNext stop_session
       * 5. Finalize Timesheet
       */

      return {
        success: true,
        sessionId: stoppedSession.sessionId,
        startedAt: stoppedSession.startedAt,
        stoppedAt,
        durationSeconds,
      };
    } catch (error: any) {
      console.error(error);

      throw new Error(error.message);
    }
  });
}
