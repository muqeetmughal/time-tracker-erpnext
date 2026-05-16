"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld(
  "tracker",
  {
    start: (payload) => electron.ipcRenderer.invoke(
      "tracker:start",
      payload
    ),
    stop: () => electron.ipcRenderer.invoke(
      "tracker:stop"
    )
  }
);
