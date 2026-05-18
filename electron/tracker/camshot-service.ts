import { BrowserWindow } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import { insertActivitySessionMedia, insertActivityTimeline } from "../db";
import type { AppConfig } from "../types";
import { reviewImageBeforeUpload } from "./image-review";
import { getNextCaptureDelay } from "./timing";
import type { UploadQueueService } from "./upload-queue-service";

type CamshotCapture = {
  timestamp: string;
  filePath: string;
  approved: boolean;
  rejected: boolean;
  cameraId: string;
};

export class CamshotService {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private isPaused = false;

  constructor(private readonly uploadQueue: UploadQueueService) {}

  start(sessionId: string, getConfigSnapshot: () => AppConfig) {
    this.isRunning = true;
    this.isPaused = false;
    this.schedule(sessionId, getConfigSnapshot, 1_500);
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

      if (!this.isPaused && config.general.takeCamshots) {
        await this.capture(sessionId, config);
      }

      this.schedule(sessionId, getConfigSnapshot);
    }, delayMs);
  }

  private async capture(sessionId: string, config: AppConfig) {
    try {
      const capture = await captureCamshot(config);

      if (!capture) {
        return;
      }

      const imageId = insertActivitySessionMedia({
        sessionId,
        mediaType: "camshot",
        filePath: capture.filePath,
        timestamp: capture.timestamp,
        approved: capture.approved,
        rejected: capture.rejected,
        cameraId: capture.cameraId,
      });

      insertActivityTimeline({
        sessionId,
        type: "camshot_taken",
        timestamp: capture.timestamp,
        imageId,
      });

      if (capture.approved && !capture.rejected) {
        this.uploadQueue.enqueue({ id: imageId, filePath: capture.filePath });
      }
    } catch (error) {
      console.error("Camshot capture failed:", error);
    }
  }
}

async function captureCamshot(config: AppConfig): Promise<CamshotCapture | null> {
  if (!config.general.takeCamshots) {
    return null;
  }

  const dir = path.join(process.cwd(), "camshots");
  await fs.mkdir(dir, { recursive: true });

  const timestampMs = Date.now();
  const filePath = path.join(dir, `${timestampMs}.jpg`);
  const cameraId = config.trackingSources.cameraId;
  const imageData = await captureCameraImage(cameraId);

  if (!imageData) {
    return null;
  }

  await fs.writeFile(filePath, imageData);

  const approved = await reviewImageBeforeUpload(filePath, config);

  return {
    timestamp: new Date(timestampMs).toISOString(),
    filePath,
    approved,
    rejected: !approved,
    cameraId,
  };
}

function captureCameraImage(cameraId: string) {
  return new Promise<Buffer | null>((resolve) => {
    const window = new BrowserWindow({
      width: 320,
      height: 240,
      show: false,
      webPreferences: {
        contextIsolation: false,
        nodeIntegration: true,
      },
    });
    const timeout = setTimeout(() => {
      resolve(null);
      window.close();
    }, 10_000);
    const html = buildCameraCaptureHtml(cameraId);

    window.webContents.once("ipc-message", (_event, channel, payload: string) => {
      if (channel !== "camshot:capture") {
        return;
      }

      clearTimeout(timeout);

      if (!payload.startsWith("data:image/jpeg;base64,")) {
        resolve(null);
        window.close();
        return;
      }

      resolve(Buffer.from(payload.replace("data:image/jpeg;base64,", ""), "base64"));
      window.close();
    });

    window.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  });
}

function buildCameraCaptureHtml(cameraId: string) {
  return `
    <!doctype html>
    <html>
      <body>
        <video autoplay playsinline style="width:320px;height:240px"></video>
        <canvas width="320" height="240"></canvas>
        <script>
          const { ipcRenderer } = require('electron');
          const video = document.querySelector('video');
          const canvas = document.querySelector('canvas');
          const constraints = {
            video: ${JSON.stringify(
              cameraId ? { deviceId: { exact: cameraId } } : true,
            )}
          };

          async function capture() {
            try {
              const stream = await navigator.mediaDevices.getUserMedia(constraints);
              video.srcObject = stream;
              await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
              });
              await video.play();
              canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
              stream.getTracks().forEach((track) => track.stop());
              ipcRenderer.send('camshot:capture', canvas.toDataURL('image/jpeg', 0.85));
            } catch (error) {
              ipcRenderer.send('camshot:capture', '');
            }
          }

          capture();
        </script>
      </body>
    </html>
  `;
}
