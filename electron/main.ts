
// import { app, BrowserWindow } from 'electron'
// import { createRequire } from 'node:module'
// import { fileURLToPath } from 'node:url'
// import path from 'node:path'

// const require = createRequire(import.meta.url)
// const __dirname = path.dirname(fileURLToPath(import.meta.url))

// // The built directory structure
// //
// // ├─┬─┬ dist
// // │ │ └── index.html
// // │ │
// // │ ├─┬ dist-electron
// // │ │ ├── main.js
// // │ │ └── preload.mjs
// // │
// process.env.APP_ROOT = path.join(__dirname, '..')

// // 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
// export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
// export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
// export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

// process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

// let win: BrowserWindow | null

// function createWindow() {
//   win = new BrowserWindow({
//     icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
//     webPreferences: {
//       preload: path.join(__dirname, 'preload.mjs'),
//     },
//   })

//   // Test active push message to Renderer-process.
//   win.webContents.on('did-finish-load', () => {
//     win?.webContents.send('main-process-message', (new Date).toLocaleString())
//   })

//   if (VITE_DEV_SERVER_URL) {
//     win.loadURL(VITE_DEV_SERVER_URL)
//   } else {
//     // win.loadFile('dist/index.html')
//     win.loadFile(path.join(RENDERER_DIST, 'index.html'))
//   }
// }

// // Quit when all windows are closed, except on macOS. There, it's common
// // for applications and their menu bar to stay active until the user quits
// // explicitly with Cmd + Q.
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit()
//     win = null
//   }
// })



// app.on('activate', () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow()
//   }
// })

// app.whenReady().then(createWindow)



import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
} from 'electron'




import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

const isDev =
  process.env.NODE_ENV === 'development'

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,

    backgroundColor: '#0f172a',

    webPreferences: {
      preload: path.join(
        __dirname,
        'preload.js'
      ),

      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(
      process.env.VITE_DEV_SERVER_URL
    )

    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(
      path.join(
        __dirname,
        '../renderer/index.html'
      )
    )
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault()

      mainWindow?.hide()
    }

    return false
  })
}

function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(
      __dirname,
      '../../resources/icon.png'
    )
  )

  tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Tracker',

      click: () => {
        mainWindow?.show()
      },
    },

    {
      label: 'Start Tracking',

      click: async () => {
        console.log('Tracking Started')
      },
    },

    {
      label: 'Stop Tracking',

      click: async () => {
        console.log('Tracking Stopped')
      },
    },

    {
      type: 'separator',
    },

    {
      label: 'Quit',

      click: () => {
        app.isQuiting = true

        app.quit()
      },
    },
  ])

  tray.setToolTip(
    'ERPNext Time Tracker'
  )

  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    mainWindow?.show()
  })
}

async function bootstrap() {
  createWindow()
  createTray()
}

app.whenReady().then(async () => {
  await bootstrap()

  app.on('activate', () => {
    if (
      BrowserWindow.getAllWindows().length === 0
    ) {
      createWindow()
    } else {
      mainWindow?.show()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle(
  'tracker:start',
  async (_, payload) => {
    try {
      console.log(
        'Tracker Start Payload:',
        payload
      )

      /**
       * TODO:
       * 1. Create local tracker session
       * 2. Call ERPNext start_session API
       * 3. Start screenshot interval
       * 4. Start activity interval
       * 5. Start heartbeat
       */

      return {
        success: true,
        sessionId:
          'session-' + Date.now(),
      }
    } catch (error: any) {
      console.error(error)

      return {
        success: false,
        error: error.message,
      }
    }
  }
)

ipcMain.handle(
  'tracker:stop',
  async (_, sessionId) => {
    try {
      console.log(
        'Stopping Tracker:',
        sessionId
      )

      /**
       * TODO:
       * 1. Stop intervals
       * 2. Upload pending screenshots
       * 3. Upload activity logs
       * 4. Call ERPNext stop_session
       * 5. Finalize Timesheet
       */

      return {
        success: true,
      }
    } catch (error: any) {
      console.error(error)

      return {
        success: false,
        error: error.message,
      }
    }
  }
)

ipcMain.handle(
  'projects:get',
  async () => {
    try {
      /**
       * TODO:
       * Call ERPNext get_projects API
       */

      return [
        {
          name: 'PROJ-0001',
          project_name:
            'ERPNext Implementation',
        },

        {
          name: 'PROJ-0002',
          project_name:
            'HRMS Development',
        },
      ]
    } catch (error: any) {
      console.error(error)

      return []
    }
  }
)

ipcMain.handle(
  'tasks:get',
  async (_, project) => {
    try {
      /**
       * TODO:
       * Call ERPNext get_tasks API
       */

      return [
        {
          name: 'TASK-0001',
          subject:
            'Frontend Dashboard',
        },

        {
          name: 'TASK-0002',
          subject:
            'Tracker API Integration',
        },
      ]
    } catch (error: any) {
      console.error(error)

      return []
    }
  }
)

ipcMain.handle(
  'settings:get',
  async () => {
    return {
      screenshot_frequency_seconds: 300,
      idle_timeout_minutes: 5,
      popup_frequency_minutes: 30,
      auto_submit_timesheet: false,
    }
  }
)

declare global {
  interface App {
    isQuiting?: boolean
  }
}