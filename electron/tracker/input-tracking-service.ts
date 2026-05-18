import { createRequire } from "node:module";
import { systemPreferences } from "electron";
import { insertInputActivity } from "../db";
import type { AppConfig, InputActivityKind } from "../types";

type UiohookModule = {
  uIOhook?: {
    on: (eventName: string, listener: () => void) => void;
    off: (eventName: string, listener: () => void) => void;
    start: () => void;
    stop: () => void;
  };
};

const FLUSH_INTERVAL_MS = 60_000;
const require = createRequire(import.meta.url);

export class InputTrackingService {
  private keyboardCount = 0;
  private mouseClickCount = 0;
  private flushTimer: NodeJS.Timeout | null = null;
  private isPaused = false;
  private sessionId = "";
  private hook: UiohookModule["uIOhook"] | null = null;
  private keyListener = () => {
    if (!this.isPaused) {
      this.keyboardCount += 1;
    }
  };
  private mouseListener = () => {
    if (!this.isPaused) {
      this.mouseClickCount += 1;
    }
  };

  async start(sessionId: string, config: AppConfig) {
    this.sessionId = sessionId;
    this.isPaused = false;
    this.keyboardCount = 0;
    this.mouseClickCount = 0;

    if (!config.trackingSources.countKeyboardHits && !config.trackingSources.countMouseClicks) {
      return;
    }

    if (process.platform === "darwin") {
      const hasAccessibilityAccess =
        systemPreferences.isTrustedAccessibilityClient(false);

      if (!hasAccessibilityAccess) {
        systemPreferences.isTrustedAccessibilityClient(true);
        console.warn(
          "Keyboard/mouse activity tracking is paused until Accessibility permission is granted for this app.",
        );
        return;
      }
    }

    try {
      const module = require("uiohook-napi") as UiohookModule;
      this.hook = module.uIOhook || null;

      if (!this.hook) {
        return;
      }

      if (config.trackingSources.countKeyboardHits) {
        this.hook.on("keydown", this.keyListener);
      }

      if (config.trackingSources.countMouseClicks) {
        this.hook.on("mousedown", this.mouseListener);
      }

      this.hook.start();
      this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
    } catch (error) {
      console.warn("Input tracking is unavailable:", error);
    }
  }

  pause() {
    this.flush();
    this.isPaused = true;
  }

  resume() {
    this.isPaused = false;
  }

  stop() {
    this.flush();

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.hook) {
      this.hook.off("keydown", this.keyListener);
      this.hook.off("mousedown", this.mouseListener);
      this.hook.stop();
      this.hook = null;
    }

    this.sessionId = "";
  }

  private flush() {
    if (!this.sessionId) {
      return;
    }

    const timestamp = new Date().toISOString();
    this.flushKind("keyboard", this.keyboardCount, timestamp);
    this.flushKind("mouse", this.mouseClickCount, timestamp);
    this.keyboardCount = 0;
    this.mouseClickCount = 0;
  }

  private flushKind(kind: InputActivityKind, count: number, timestamp: string) {
    if (count <= 0) {
      return;
    }

    insertInputActivity({
      sessionId: this.sessionId,
      kind,
      timestamp,
      count,
    });
  }
}
