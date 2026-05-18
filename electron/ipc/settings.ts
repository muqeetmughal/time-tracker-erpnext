import { ipcMain } from "electron";

export function registerSettingsHandlers() {
  ipcMain.handle("settings:get", async () => {
    return {
      screenshot_frequency_seconds: 300,
      idle_timeout_minutes: 5,
      popup_frequency_minutes: 30,
      auto_submit_timesheet: false,
    };
  });
}
