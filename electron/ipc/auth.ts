import { ipcMain } from "electron";
import {
  clearCredentials,
  normalizeSiteUrl,
  saveCredentials,
  store,
} from "../store";
import type { Credentials } from "../types";

export function registerAuthHandlers() {
  ipcMain.handle("auth:get", async () => {
    const credentials = store.get("credentials");

    if (!credentials) {
      return {
        loggedIn: false,
        siteUrl: "",
      };
    }

    return {
      loggedIn: true,
      siteUrl: credentials.siteUrl,
    };
  });

  ipcMain.handle("auth:login", async (_, credentials: Credentials) => {
    const siteUrl = normalizeSiteUrl(credentials.siteUrl);
    const apiKey = credentials.apiKey.trim();
    const apiSecret = credentials.apiSecret.trim();

    if (!siteUrl || !apiKey || !apiSecret) {
      throw new Error("Site URL, API key, and API secret are required.");
    }

    saveCredentials({
      siteUrl,
      apiKey,
      apiSecret,
    });

    return {
      success: true,
      siteUrl,
    };
  });

  ipcMain.handle("auth:logout", async () => {
    clearCredentials();

    return {
      success: true,
    };
  });
}
