import { ipcMain } from "electron";
import { frappeGet, getApiErrorMessage } from "../api/frappe";
import type { FrappeListResponse, FrappeMethodResponse } from "../types";

export function registerFrappeHandlers() {
  ipcMain.handle("user:get-logged-user", async () => {
    try {
      const response = await frappeGet<FrappeMethodResponse<string>>(
        "/api/method/frappe.auth.get_logged_user",
      );

      return response.message;
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Failed to fetch logged user:", message);

      throw new Error(message);
    }
  });

  ipcMain.handle("projects:get", async () => {
    try {
      const response = await frappeGet<FrappeListResponse<Project>>(
        "/api/resource/Project",
        {
          params: {
            fields: JSON.stringify(["*"]),
          },
        },
      );

      return response.data;
    } catch (error) {
      const message = getApiErrorMessage(error);
      console.error("Failed to fetch projects:", message);

      throw new Error(message);
    }
  });
}
