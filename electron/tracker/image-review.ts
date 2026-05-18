import { BrowserWindow, ipcMain, screen } from "electron";
import fs from "node:fs/promises";
import path from "node:path";
import type { AppConfig } from "../types";

const imageMimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function reviewImageBeforeUpload(
  imagePath: string,
  config: AppConfig,
): Promise<boolean> {
  if (!config.general.reviewImagesBeforeUpload) {
    return true;
  }

  let imageDataUrl = "";

  try {
    imageDataUrl = await getImageDataUrl(imagePath);
  } catch (error) {
    console.warn("Unable to load image preview for review:", error);
    return true;
  }

  return new Promise((resolve) => {
    const reviewId = `image-review-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
    const display = screen.getPrimaryDisplay();
    const width = 320;
    const height = 260;
    const margin = 16;
    const reviewWindow = new BrowserWindow({
      width,
      height,
      x: display.workArea.x + display.workArea.width - width - margin,
      y: display.workArea.y + margin,
      frame: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      title: "Review Image",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });
    let settled = false;

    function cleanup() {
      ipcMain.removeListener("image-review:allow", handleAllow);
      ipcMain.removeListener("image-review:reject", handleReject);
    }

    function settle(allowed: boolean) {
      if (settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(allowed);

      if (!reviewWindow.isDestroyed()) {
        reviewWindow.close();
      }
    }

    function handleAllow(_: Electron.IpcMainEvent, payload: { reviewId: string }) {
      if (payload.reviewId === reviewId) {
        settle(true);
      }
    }

    function handleReject(_: Electron.IpcMainEvent, payload: { reviewId: string }) {
      if (payload.reviewId === reviewId) {
        settle(false);
      }
    }

    ipcMain.on("image-review:allow", handleAllow);
    ipcMain.on("image-review:reject", handleReject);

    reviewWindow.on("closed", () => {
      settle(true);
    });

    setTimeout(() => {
      settle(true);
    }, config.advanced.screenshotReviewSeconds * 1000);

    reviewWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(`
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              * { box-sizing: border-box; }
              body {
                margin: 0;
                background: white;
                border: 1px solid #d1d5db;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                color: #4b5563;
              }
              .wrap { padding: 10px; }
              h1 { margin: 0 0 8px; font-size: 14px; font-weight: 600; }
              img {
                width: 100%;
                height: 160px;
                object-fit: cover;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                background: #f3f4f6;
              }
              .actions {
                display: flex;
                justify-content: flex-end;
                gap: 8px;
                margin-top: 10px;
              }
              button {
                border: 1px solid #d1d5db;
                border-radius: 4px;
                background: white;
                padding: 7px 12px;
                color: #4b5563;
                font-size: 13px;
              }
              .allow {
                border-color: #3ab175;
                background: #3ab175;
                color: white;
              }
            </style>
          </head>
          <body>
            <div class="wrap">
              <h1>Review Image Before Upload</h1>
              <img src="${escapeHtml(imageDataUrl)}" />
              <div class="actions">
                <button id="reject">Reject</button>
                <button class="allow" id="allow">Allow</button>
              </div>
            </div>
            <script>
              const { ipcRenderer } = require('electron');
              const reviewId = ${JSON.stringify(reviewId)};
              document.getElementById('allow').addEventListener('click', () => {
                ipcRenderer.send('image-review:allow', { reviewId });
              });
              document.getElementById('reject').addEventListener('click', () => {
                ipcRenderer.send('image-review:reject', { reviewId });
              });
            </script>
          </body>
        </html>
      `)}`,
    );
  });
}

async function getImageDataUrl(imagePath: string) {
  const extension = path.extname(imagePath).toLowerCase();
  const mimeType = imageMimeTypes[extension] || "image/jpeg";
  const image = await fs.readFile(path.resolve(imagePath));

  return `data:${mimeType};base64,${image.toString("base64")}`;
}
