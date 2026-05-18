import { ipcMain } from "electron";
import { activitySessionService } from "../tracker/activity-session-service";
import type {
  TrackerStartPayload,
  TrackerStartResult,
  TrackerStatusResult,
  TrackerStopResult,
  TrackerUpdateActivityPayload,
  TrackerUpdateActivityResult,
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

  ipcMain.handle("tracker:status", async (): Promise<TrackerStatusResult> => {
    return activitySessionService.getStatus();
  });

  ipcMain.handle(
    "tracker:update-activity",
    async (
      _,
      payload: TrackerUpdateActivityPayload,
    ): Promise<TrackerUpdateActivityResult> => {
      return activitySessionService.updateActivity(payload);
    },
  );
}
