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
      )
    },
    settings: {
      get: () => electron.ipcRenderer.invoke(
        "settings:get"
      )
    }
  }
);
