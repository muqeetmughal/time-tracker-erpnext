import { ipcRenderer, contextBridge } from 'electron'

// // --------- Expose some API to the Renderer process ---------
// contextBridge.exposeInMainWorld('ipcRenderer', {
//   on(...args: Parameters<typeof ipcRenderer.on>) {
//     const [channel, listener] = args
//     return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
//   },
//   off(...args: Parameters<typeof ipcRenderer.off>) {
//     const [channel, ...omit] = args
//     return ipcRenderer.off(channel, ...omit)
//   },
//   send(...args: Parameters<typeof ipcRenderer.send>) {
//     const [channel, ...omit] = args
//     return ipcRenderer.send(channel, ...omit)
//   },
//   invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
//     const [channel, ...omit] = args
//     return ipcRenderer.invoke(channel, ...omit)
//   },

//   // You can expose other APTs you need here.
//   // ...
// })


contextBridge.exposeInMainWorld(
  'api',
  {
    tracker: {
      start: (payload: any) =>
        ipcRenderer.invoke(
          'tracker:start',
          payload
        ),

      stop: () =>
        ipcRenderer.invoke(
          'tracker:stop'
        ),
    },

    auth: {
      get: () =>
        ipcRenderer.invoke(
          'auth:get'
        ),

      login: (payload: any) =>
        ipcRenderer.invoke(
          'auth:login',
          payload
        ),

      logout: () =>
        ipcRenderer.invoke(
          'auth:logout'
        ),
    },

    user: {
      getLoggedUser: () =>
        ipcRenderer.invoke(
          'user:get-logged-user'
        ),
    },

    projects: {
      get: () =>
        ipcRenderer.invoke(
          'projects:get'
        ),
    },

    activities: {
      create: (payload: any) =>
        ipcRenderer.invoke(
          'activities:create',
          payload
        ),

      prompt: (payload: any) =>
        ipcRenderer.invoke(
          'activities:prompt',
          payload
        ),

      promptDescription: (payload: any) =>
        ipcRenderer.invoke(
          'activities:prompt-description',
          payload
        ),

      listRecentUnsynced: (limit?: number) =>
        ipcRenderer.invoke(
          'activities:list-recent-unsynced',
          limit
        ),

      listRecentSessions: (limit?: number) =>
        ipcRenderer.invoke(
          'activities:list-recent-sessions',
          limit
        ),

      listMedia: (filter?: any, limit?: number) =>
        ipcRenderer.invoke(
          'activities:list-media',
          filter,
          limit
        ),
    },

    settings: {
      get: () =>
        ipcRenderer.invoke(
          'settings:get'
        ),
    },

    config: {
      openWindow: () =>
        ipcRenderer.invoke(
          'config:open-window'
        ),

      get: () =>
        ipcRenderer.invoke(
          'config:get'
        ),

      save: (payload: any) =>
        ipcRenderer.invoke(
          'config:save',
          payload
        ),

      reset: () =>
        ipcRenderer.invoke(
          'config:reset'
        ),

      onUpdated: (callback: (config: any) => void) => {
        const listener = (_event: Electron.IpcRendererEvent, config: any) =>
          callback(config)

        ipcRenderer.on(
          'config:updated',
          listener
        )

        return () =>
          ipcRenderer.off(
            'config:updated',
            listener
          )
      },
    },
  }
)
