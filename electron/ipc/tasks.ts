import { ipcMain } from "electron";

export function registerTaskHandlers() {
  ipcMain.handle("tasks:get", async (_, _project) => {
    try {
      /**
       * TODO:
       * Call ERPNext get_tasks API
       */

      return [
        {
          name: "TASK-0001",
          subject: "Frontend Dashboard",
        },
        {
          name: "TASK-0002",
          subject: "Tracker API Integration",
        },
      ];
    } catch (error: any) {
      console.error(error);

      return [];
    }
  });
}
