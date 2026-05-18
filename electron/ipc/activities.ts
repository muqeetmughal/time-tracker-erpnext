import { BrowserWindow, ipcMain } from "electron";
import { getMainWindow } from "../app-shell";
import { insertActivity } from "../db";
import type { ActivityInput, ActivityPromptInput, ActivityRecord } from "../types";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildPromptHtml(promptId: string, input: ActivityPromptInput) {
  const title = escapeHtml(input.title);
  const projectLabel = escapeHtml(input.projectLabel || input.project);

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #f4f4f4;
            color: #4b5563;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          form {
            height: 100vh;
            padding: 18px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 12px;
          }
          h1 {
            margin: 0;
            color: #374151;
            font-size: 18px;
            font-weight: 500;
          }
          p {
            margin: -4px 0 4px;
            color: #9ca3af;
            font-size: 12px;
          }
          input {
            width: 100%;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            padding: 10px 12px;
            color: #374151;
            font-size: 14px;
            outline: none;
          }
          input:focus { border-color: #60a5fa; }
          .error {
            min-height: 18px;
            color: #dc2626;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <form id="activity-form">
          <div>
            <h1>${title}</h1>
            <p>${projectLabel}</p>
          </div>
          <input id="description" autofocus placeholder="Activity description" />
          <div class="error" id="error"></div>
        </form>
        <script>
          const { ipcRenderer } = require('electron');
          const form = document.getElementById('activity-form');
          const input = document.getElementById('description');
          const error = document.getElementById('error');

          form.addEventListener('submit', (event) => {
            event.preventDefault();
            const description = input.value.trim();

            if (!description) {
              error.textContent = 'Activity description is required.';
              input.focus();
              return;
            }

            ipcRenderer.send('activity-prompt:submit', {
              promptId: ${JSON.stringify(promptId)},
              description,
            });
          });

          window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
              ipcRenderer.send('activity-prompt:cancel', {
                promptId: ${JSON.stringify(promptId)},
              });
            }
          });
        </script>
      </body>
    </html>
  `;
}

function openActivityPrompt(input: ActivityPromptInput) {
  return new Promise<ActivityRecord | null>((resolve, reject) => {
    const promptId = `activity-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`;
    const parent = getMainWindow() || undefined;
    const promptWindow = new BrowserWindow({
      width: 420,
      height: 220,
      parent,
      modal: Boolean(parent),
      resizable: false,
      minimizable: false,
      maximizable: false,
      title: input.title,
      backgroundColor: "#f4f4f4",
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    let settled = false;

    function cleanup() {
      ipcMain.removeListener("activity-prompt:submit", handleSubmit);
      ipcMain.removeListener("activity-prompt:cancel", handleCancel);
    }

    function closeWindow() {
      if (!promptWindow.isDestroyed()) {
        promptWindow.close();
      }
    }

    function handleCancel(_: Electron.IpcMainEvent, payload: { promptId: string }) {
      if (payload.promptId !== promptId || settled) {
        return;
      }

      settled = true;
      cleanup();
      resolve(null);
      closeWindow();
    }

    function handleSubmit(
      _: Electron.IpcMainEvent,
      payload: { promptId: string; description: string },
    ) {
      if (payload.promptId !== promptId || settled) {
        return;
      }

      settled = true;
      cleanup();

      try {
        const record = insertActivity({
          ...input,
          description: payload.description,
        });

        resolve(record);
        closeWindow();
      } catch (error) {
        reject(error);
        closeWindow();
      }
    }

    ipcMain.on("activity-prompt:submit", handleSubmit);
    ipcMain.on("activity-prompt:cancel", handleCancel);

    promptWindow.on("closed", () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(null);
      }
    });

    promptWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(
        buildPromptHtml(promptId, input),
      )}`,
    );
  });
}

export function registerActivityHandlers() {
  ipcMain.handle("activities:create", async (_, input: ActivityInput) => {
    const description = input.description.trim();

    if (!input.project) {
      throw new Error("Please select a project first.");
    }

    if (!description) {
      throw new Error("Activity description is required.");
    }

    return insertActivity({
      ...input,
      description,
    });
  });

  ipcMain.handle("activities:prompt", async (_, input: ActivityPromptInput) => {
    if (!input.project) {
      throw new Error("Please select a project first.");
    }

    return openActivityPrompt(input);
  });
}
