import { BrowserWindow, ipcMain } from "electron";
import { openConfigurationWindow } from "../app-shell";
import {
  getConfig,
  resetConfigToDefaults,
  saveConfig,
} from "../store";
import type { AppConfig, DeepPartial } from "../types";

type ConfigWindowOptions = {
  dirname: string;
  isDev: boolean;
  viteDevServerUrl?: string;
};

export function registerConfigHandlers(options: ConfigWindowOptions) {
  function broadcastConfig(config: AppConfig) {
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send("config:updated", config);
    });
  }

  ipcMain.handle("config:open-window", async () => {
    openConfigurationWindow(options);
    return {
      success: true,
    };
  });

  ipcMain.handle("config:get", async () => {
    return getConfig();
  });

  ipcMain.handle("config:save", async (_, partialConfig: DeepPartial<AppConfig>) => {
    const config = saveConfig(partialConfig);

    broadcastConfig(config);
    return config;
  });

  ipcMain.handle("config:reset", async () => {
    const config = resetConfigToDefaults();

    broadcastConfig(config);
    return config;
  });
}
