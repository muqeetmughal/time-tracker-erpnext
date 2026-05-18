import { ipcMain } from "electron";
import { activitySessionService } from "../tracker/activity-session-service";
import type {
  TrackerStartPayload,
  TrackerStartResult,
  TrackerStopResult,
} from "../types";

export function registerTrackerHandlers() {
  ipcMain.handle(
    "tracker:start",
    async (_, payload: TrackerStartPayload): Promise<TrackerStartResult> => {
      return activitySessionService.start(payload);
    },
  );

  ipcMain.handle("tracker:stop", async (): Promise<TrackerStopResult> => {
    return activitySessionService.stop();
  });
}
