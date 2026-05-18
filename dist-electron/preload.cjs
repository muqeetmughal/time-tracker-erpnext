"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld(
  "api",
  {
    tracker: {
      start: (payload) => electron.ipcRenderer.invoke(
        "tracker:start",
        payload
      ),
      stop: () => electron.ipcRenderer.invoke(
        "tracker:stop"
      ),
      status: () => electron.ipcRenderer.invoke(
        "tracker:status"
      )
    },
    auth: {
      get: () => electron.ipcRenderer.invoke(
        "auth:get"
      ),
      login: (payload) => electron.ipcRenderer.invoke(
        "auth:login",
        payload
      ),
      logout: () => electron.ipcRenderer.invoke(
        "auth:logout"
      )
    },
    user: {
      getLoggedUser: () => electron.ipcRenderer.invoke(
        "user:get-logged-user"
      )
    },
    projects: {
      get: () => electron.ipcRenderer.invoke(
        "projects:get"
      )
    },
    activities: {
      create: (payload) => electron.ipcRenderer.invoke(
        "activities:create",
        payload
      ),
      prompt: (payload) => electron.ipcRenderer.invoke(
        "activities:prompt",
        payload
      ),
      promptDescription: (payload) => electron.ipcRenderer.invoke(
        "activities:prompt-description",
        payload
      ),
      listRecentUnsynced: (limit) => electron.ipcRenderer.invoke(
        "activities:list-recent-unsynced",
        limit
      ),
      listRecentSessions: (limit) => electron.ipcRenderer.invoke(
        "activities:list-recent-sessions",
        limit
      ),
      listMedia: (filter, limit) => electron.ipcRenderer.invoke(
        "activities:list-media",
        filter,
        limit
      )
    },
    settings: {
      get: () => electron.ipcRenderer.invoke(
        "settings:get"
      )
    },
    config: {
      openWindow: () => electron.ipcRenderer.invoke(
        "config:open-window"
      ),
      get: () => electron.ipcRenderer.invoke(
        "config:get"
      ),
      save: (payload) => electron.ipcRenderer.invoke(
        "config:save",
        payload
      ),
      reset: () => electron.ipcRenderer.invoke(
        "config:reset"
      ),
      onUpdated: (callback) => {
        const listener = (_event, config) => callback(config);
        electron.ipcRenderer.on(
          "config:updated",
          listener
        );
        return () => electron.ipcRenderer.off(
          "config:updated",
          listener
        );
      }
    }
  }
);
