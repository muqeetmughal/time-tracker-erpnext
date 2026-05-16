import { app, BrowserWindow, ipcMain, nativeImage, Tray, Menu } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
createRequire(import.meta.url);
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let mainWindow = null;
let tray = null;
const isDev = process.env.NODE_ENV === "development";
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(
        __dirname$1,
        "preload.js"
      ),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL
    );
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(
      path.join(
        __dirname$1,
        "../renderer/index.html"
      )
    );
  }
  mainWindow.on("close", (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow == null ? void 0 : mainWindow.hide();
    }
    return false;
  });
}
function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(
      __dirname$1,
      "../../resources/icon.png"
    )
  );
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Tracker",
      click: () => {
        mainWindow == null ? void 0 : mainWindow.show();
      }
    },
    {
      label: "Start Tracking",
      click: async () => {
        console.log("Tracking Started");
      }
    },
    {
      label: "Stop Tracking",
      click: async () => {
        console.log("Tracking Stopped");
      }
    },
    {
      type: "separator"
    },
    {
      label: "Quit",
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  tray.setToolTip(
    "ERPNext Time Tracker"
  );
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    mainWindow == null ? void 0 : mainWindow.show();
  });
}
async function bootstrap() {
  createWindow();
  createTray();
}
app.whenReady().then(async () => {
  await bootstrap();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow == null ? void 0 : mainWindow.show();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
ipcMain.handle(
  "tracker:start",
  async (_, payload) => {
    try {
      console.log(
        "Tracker Start Payload:",
        payload
      );
      return {
        success: true,
        sessionId: "session-" + Date.now()
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error.message
      };
    }
  }
);
ipcMain.handle(
  "tracker:stop",
  async (_, sessionId) => {
    try {
      console.log(
        "Stopping Tracker:",
        sessionId
      );
      return {
        success: true
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error.message
      };
    }
  }
);
ipcMain.handle(
  "projects:get",
  async () => {
    try {
      return [
        {
          name: "PROJ-0001",
          project_name: "ERPNext Implementation"
        },
        {
          name: "PROJ-0002",
          project_name: "HRMS Development"
        }
      ];
    } catch (error) {
      console.error(error);
      return [];
    }
  }
);
ipcMain.handle(
  "tasks:get",
  async (_, project) => {
    try {
      return [
        {
          name: "TASK-0001",
          subject: "Frontend Dashboard"
        },
        {
          name: "TASK-0002",
          subject: "Tracker API Integration"
        }
      ];
    } catch (error) {
      console.error(error);
      return [];
    }
  }
);
ipcMain.handle(
  "settings:get",
  async () => {
    return {
      screenshot_frequency_seconds: 300,
      idle_timeout_minutes: 5,
      popup_frequency_minutes: 30,
      auto_submit_timesheet: false
    };
  }
);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
