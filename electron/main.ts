import { app } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { bootstrapAppShell, showOrCreateWindow } from "./app-shell";
import { registerIpcHandlers } from "./ipc";

declare global {
  namespace Electron {
    interface App {
      isQuitting?: boolean;
    }
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.cjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

const appShellOptions = {
  dirname: __dirname,
  isDev: process.env.NODE_ENV === "development",
  viteDevServerUrl: VITE_DEV_SERVER_URL,
};

registerIpcHandlers();

app.whenReady().then(async () => {
  bootstrapAppShell(appShellOptions);

  app.on("activate", () => {
    showOrCreateWindow(appShellOptions);
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
