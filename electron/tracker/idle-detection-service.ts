import { powerMonitor } from "electron";
import { endIdlePeriod, insertActivityTimeline, startIdlePeriod, updateActivitySessionStatus } from "../db";
import type { AppConfig } from "../types";

const CHECK_INTERVAL_MS = 15_000;

type IdleCallbacks = {
  onIdleStarted: () => void;
  onIdleEnded: () => void;
};

export class IdleDetectionService {
  private timer: NodeJS.Timeout | null = null;
  private idleStartedAt = "";
  private isIdle = false;

  start(sessionId: string, config: AppConfig, callbacks: IdleCallbacks) {
    const timeoutMinutes = config.general.idleTimeoutMinutes;

    if (!timeoutMinutes) {
      return;
    }

    this.timer = setInterval(() => {
      const idleSeconds = powerMonitor.getSystemIdleTime();
      const idleThresholdSeconds = timeoutMinutes * 60;
      const now = new Date().toISOString();

      if (!this.isIdle && idleSeconds >= idleThresholdSeconds) {
        this.isIdle = true;
        this.idleStartedAt = now;
        startIdlePeriod({ sessionId, startTime: now });
        insertActivityTimeline({
          sessionId,
          type: "idle_started",
          timestamp: now,
        });
        updateActivitySessionStatus(sessionId, "idle");
        callbacks.onIdleStarted();
        return;
      }

      if (this.isIdle && idleSeconds < idleThresholdSeconds) {
        const startTime = this.idleStartedAt;

        this.isIdle = false;
        this.idleStartedAt = "";
        endIdlePeriod({ sessionId, startTime, endTime: now });
        insertActivityTimeline({
          sessionId,
          type: "idle_ended",
          timestamp: now,
        });
        updateActivitySessionStatus(sessionId, "active");
        callbacks.onIdleEnded();
      }
    }, CHECK_INTERVAL_MS);
  }

  stop(sessionId: string) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (this.isIdle && this.idleStartedAt) {
      endIdlePeriod({
        sessionId,
        startTime: this.idleStartedAt,
        endTime: new Date().toISOString(),
      });
    }

    this.isIdle = false;
    this.idleStartedAt = "";
  }
}
