import { insertActivitySessionMedia, insertActivityTimeline } from "../db";
import type { AppConfig } from "../types";
import { captureScreenshotsDetailed } from "./screenshots";
import { getNextCaptureDelay } from "./timing";
import type { UploadQueueService } from "./upload-queue-service";

export class ScreenshotService {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private isPaused = false;

  constructor(private readonly uploadQueue: UploadQueueService) {}

  start(sessionId: string, getConfigSnapshot: () => AppConfig) {
    this.isRunning = true;
    this.isPaused = false;
    this.schedule(sessionId, getConfigSnapshot, 1_000);
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    this.isRunning = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private schedule(
    sessionId: string,
    getConfigSnapshot: () => AppConfig,
    delayMs = getNextCaptureDelay(getConfigSnapshot()),
  ) {
    if (!this.isRunning) {
      return;
    }

    this.timer = setTimeout(async () => {
      const config = getConfigSnapshot();

      if (!this.isPaused) {
        await this.capture(sessionId, config);
      }

      this.schedule(sessionId, getConfigSnapshot);
    }, delayMs);
  }

  private async capture(sessionId: string, config: AppConfig) {
    try {
      const captures = await captureScreenshotsDetailed(config);

      captures.forEach((capture) => {
        const imageId = insertActivitySessionMedia({
          sessionId,
          mediaType: "screenshot",
          filePath: capture.filePath,
          timestamp: capture.timestamp,
          approved: capture.approved,
          rejected: capture.rejected,
        });

        insertActivityTimeline({
          sessionId,
          type: "screenshot_taken",
          timestamp: capture.timestamp,
          imageId,
        });

        if (capture.approved && !capture.rejected) {
          this.uploadQueue.enqueue({ id: imageId, filePath: capture.filePath });
        }
      });
    } catch (error) {
      console.error("Screenshot capture failed:", error);
    }
  }
}
