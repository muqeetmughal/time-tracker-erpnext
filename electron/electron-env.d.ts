/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬─┬ dist
     * │ │ └── index.html
     * │ │
     * │ ├─┬ dist-electron
     * │ │ ├── main.js
     * │ │ └── preload.cjs
     * │
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

type Project = {
  name: string
  project_name?: string
  owner?: string | boolean
  icon?: 'menu' | 'doc' | null
  [key: string]: unknown
}

type LoginPayload = {
  siteUrl: string
  apiKey: string
  apiSecret: string
}

type AuthState = {
  loggedIn: boolean
  siteUrl: string
}

type ActivityInput = {
  project: string
  type: 'start' | 'stop'
  description: string
  sessionId?: string
  createdAt?: string
  screenshotPaths?: string[]
  camshotPaths?: string[]
}

type ActivityMediaType = 'screenshot' | 'camshot'
type ActivityMediaFilter = ActivityMediaType | 'all'
type ActivityMediaUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'failed'

type ActivityRecord = {
  id: number
  project: string
  type: 'start' | 'stop'
  description: string
  sessionId: string
  createdAt: string
  screenshotPaths: string[]
  camshotPaths: string[]
  synced: boolean
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  remoteId: string
  uploadedAt: string
  syncedAt: string
  uploadError: string
}

type ActivityMediaRecord = {
  id: number
  activityId: number
  mediaType: ActivityMediaType
  filePath: string
  previewDataUrl?: string
  uploadStatus: ActivityMediaUploadStatus
  remoteId: string
  uploadedAt: string
  uploadError: string
  createdAt: string
  project: string
  activityType: 'start' | 'stop'
  description: string
}

type ActivitySessionSummaryRecord = {
  id: string
  projectId: string
  taskId: string
  description: string
  startTime: string
  endTime: string
  duration: number
  status: 'active' | 'idle' | 'stopped'
  screenshotCount: number
  camshotCount: number
  keyboardCount: number
  mouseClickCount: number
}

type ActivityPromptInput = Omit<ActivityInput, 'description'> & {
  title: string
  projectLabel?: string
}

type AppSettings = {
  screenshot_frequency_seconds: number
  idle_timeout_minutes: number
  popup_frequency_minutes: number
  auto_submit_timesheet: boolean
}

type MinuteInterval = 1 | 5 | 10 | 15 | 30 | 45 | 60
type OptionalMinuteInterval = MinuteInterval | null
type ScreenshotReviewSeconds = 5 | 10 | 15 | 30 | 60
type ScreenshotsFrom = 'primary' | 'all'

type AppConfig = {
  general: {
    trackingIntervalMinutes: MinuteInterval
    activityUpdateIntervalMinutes: OptionalMinuteInterval
    idleTimeoutMinutes: OptionalMinuteInterval
    takeScreenshots: boolean
    takeCamshots: boolean
    resumeTrackingAfterIdle: boolean
    reviewImagesBeforeUpload: boolean
  }
  advanced: {
    screenshotReviewSeconds: ScreenshotReviewSeconds
    randomizedTracking: boolean
    activityAutoComplete: boolean
    askActivityDescriptionOnTrackingStart: boolean
    askActivityDescriptionOnTrackingStop: boolean
  }
  trackingSources: {
    countKeyboardHits: boolean
    countMouseClicks: boolean
    screenshotsFrom: ScreenshotsFrom
    cameraId: string
    cameraName: string
  }
  other: {
    playSounds: boolean
    showDockIcon: boolean
    openAtLogin: boolean
  }
}

type DeepPartial<T> = {
  [Key in keyof T]?: T[Key] extends object ? DeepPartial<T[Key]> : T[Key]
}

type TrackerStartPayload = {
  project: string
  taskId?: string
  description: string
}

type TrackerStartResult = {
  success: boolean
  sessionId: string
  startedAt: string
  status: 'active' | 'idle' | 'stopped'
}

type TrackerStopResult = {
  success: boolean
  sessionId: string
  startedAt: string
  stoppedAt: string
  durationSeconds: number
  status: 'active' | 'idle' | 'stopped'
}

type TrackerStatusResult = {
  isTracking: boolean
  sessionId: string
  project: string
  description: string
  startedAt: string
  status: 'active' | 'idle' | 'stopped' | ''
}

// Used in Renderer process, exposed in `preload.ts`
interface Window {
  api: {
    auth: {
      get: () => Promise<AuthState>
      login: (payload: LoginPayload) => Promise<{ success: boolean; siteUrl: string }>
      logout: () => Promise<{ success: boolean }>
    }
    tracker: {
      start: (payload: TrackerStartPayload) => Promise<TrackerStartResult>
      stop: () => Promise<TrackerStopResult>
      status: () => Promise<TrackerStatusResult>
    }
    user: {
      getLoggedUser: () => Promise<string>
    }
    projects: {
      get: () => Promise<Project[]>
    }
    activities: {
      create: (payload: ActivityInput) => Promise<ActivityRecord>
      prompt: (payload: ActivityPromptInput) => Promise<ActivityRecord | null>
      promptDescription: (payload: ActivityPromptInput) => Promise<string | null>
      listRecentUnsynced: (limit?: number) => Promise<ActivityRecord[]>
      listRecentSessions: (limit?: number) => Promise<ActivitySessionSummaryRecord[]>
      listMedia: (
        filter?: ActivityMediaFilter,
        limit?: number,
      ) => Promise<ActivityMediaRecord[]>
    }
    settings: {
      get: () => Promise<AppSettings>
    }
    config: {
      openWindow: () => Promise<{ success: boolean }>
      get: () => Promise<AppConfig>
      save: (payload: DeepPartial<AppConfig>) => Promise<AppConfig>
      reset: () => Promise<AppConfig>
      onUpdated: (callback: (config: AppConfig) => void) => () => void
    }
  }
}
