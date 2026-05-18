import { ipcMain } from "electron";

export function registerTrackerHandlers() {
  ipcMain.handle("tracker:start", async (_, payload) => {
    try {
      console.log("Tracker Start Payload:", payload);

      /**
       * TODO:
       * 1. Create local tracker session
       * 2. Call ERPNext start_session API
       * 3. Start screenshot interval
       * 4. Start activity interval
       * 5. Start heartbeat
       */

      return {
        success: true,
        sessionId: "session-" + Date.now(),
      };
    } catch (error: any) {
      console.error(error);

      return {
        success: false,
        error: error.message,
      };
    }
  });

  ipcMain.handle("tracker:stop", async (_, sessionId) => {
    try {
      console.log("Stopping Tracker:", sessionId);

      /**
       * TODO:
       * 1. Stop intervals
       * 2. Upload pending screenshots
       * 3. Upload activity logs
       * 4. Call ERPNext stop_session
       * 5. Finalize Timesheet
       */

      return {
        success: true,
      };
    } catch (error: any) {
      console.error(error);

      return {
        success: false,
        error: error.message,
      };
    }
  });
}
