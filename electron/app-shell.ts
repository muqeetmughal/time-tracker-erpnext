import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import path from "node:path";

type AppShellOptions = {
  dirname: string;
  isDev: boolean;
  viteDevServerUrl?: string;
};

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

export function createWindow(options: AppShellOptions) {
  mainWindow = new BrowserWindow({
    width: 550,
    height: 730,
    minWidth: 550,
    minHeight: 730,
    maxWidth: 550,
    maxHeight: 730,
    resizable: false,
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(options.dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (options.isDev && options.viteDevServerUrl) {
    mainWindow.loadURL(options.viteDevServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(options.dirname, "../renderer/index.html"));
  }

  mainWindow.on("close", (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  return mainWindow;
}

export function createTray(dirname: string) {
  const icon = nativeImage.createFromPath(
    path.join(dirname, "../../resources/icon.png"),
  );

  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Tracker",
      click: () => {
        mainWindow?.show();
      },
    },
    {
      label: "Start Tracking",
      click: async () => {
        console.log("Tracking Started");
      },
    },
    {
      label: "Stop Tracking",
      click: async () => {
        console.log("Tracking Stopped");
      },
    },
    {
      type: "separator",
    },
    {
      label: "Quit",
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setToolTip("ERPNext Time Tracker");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    mainWindow?.show();
  });

  return tray;
}

export function bootstrapAppShell(options: AppShellOptions) {
  createWindow(options);
  createTray(options.dirname);
}

export function showOrCreateWindow(options: AppShellOptions) {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(options);
    return;
  }

  mainWindow?.show();
}
