import Store from "electron-store";
import type { AppStore, Credentials } from "./types";

export const store = new Store<AppStore>();

export function normalizeSiteUrl(siteUrl: string) {
  return siteUrl.trim().replace(/\/+$/, "");
}

export function getCredentials() {
  const credentials = store.get("credentials");

  if (!credentials) {
    throw new Error("Please login first.");
  }

  return credentials;
}

export function saveCredentials(credentials: Credentials) {
  store.set("credentials", credentials);
}

export function clearCredentials() {
  store.delete("credentials");
}
