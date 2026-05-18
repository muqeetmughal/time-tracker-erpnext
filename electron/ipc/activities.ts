import { ipcMain } from "electron";
import { insertActivity } from "../db";
import type { ActivityInput } from "../types";

export function registerActivityHandlers() {
  ipcMain.handle("activities:create", async (_, input: ActivityInput) => {
    const description = input.description.trim();

    if (!input.project) {
      throw new Error("Please select a project first.");
    }

    if (!description) {
      throw new Error("Activity description is required.");
    }

    return insertActivity({
      ...input,
      description,
    });
  });
}
