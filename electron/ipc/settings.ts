import { ipcMain } from "electron";
import { getConfig } from "../store";

export function registerSettingsHandlers() {
  ipcMain.handle("settings:get", async () => {
    const config = getConfig();

    return {
      screenshot_frequency_seconds: config.general.trackingIntervalMinutes * 60,
      idle_timeout_minutes: config.general.idleTimeoutMinutes || 0,
      popup_frequency_minutes: config.general.activityUpdateIntervalMinutes || 0,
      auto_submit_timesheet: false,
    };
  });
}
