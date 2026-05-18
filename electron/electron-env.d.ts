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
}

type ActivityRecord = Required<ActivityInput> & {
  id: number
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

// Used in Renderer process, exposed in `preload.ts`
interface Window {
  api: {
    auth: {
      get: () => Promise<AuthState>
      login: (payload: LoginPayload) => Promise<{ success: boolean; siteUrl: string }>
      logout: () => Promise<{ success: boolean }>
    }
    tracker: {
      start: (payload: unknown) => Promise<unknown>
      stop: () => Promise<unknown>
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
    }
    settings: {
      get: () => Promise<AppSettings>
    }
  }
}
