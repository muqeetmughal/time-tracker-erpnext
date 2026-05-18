/// <reference types="vite/client" />

type Project = {
  name: string;
  project_name?: string;
  owner?: string | boolean;
  icon?: "menu" | "doc" | null;
  [key: string]: unknown;
};

type LoginPayload = {
  siteUrl: string;
  apiKey: string;
  apiSecret: string;
};

type AuthState = {
  loggedIn: boolean;
  siteUrl: string;
};

type ActivityInput = {
  project: string;
  type: "start" | "stop";
  description: string;
  sessionId?: string;
  createdAt?: string;
};

type ActivityRecord = Required<ActivityInput> & {
  id: number;
};

type ActivityPromptInput = Omit<ActivityInput, "description"> & {
  title: string;
  projectLabel?: string;
};

type AppSettings = {
  screenshot_frequency_seconds: number;
  idle_timeout_minutes: number;
  popup_frequency_minutes: number;
  auto_submit_timesheet: boolean;
};

type TrackerStartPayload = {
  project: string;
  description: string;
};

type TrackerStartResult = {
  success: boolean;
  sessionId: string;
  startedAt: string;
};

type TrackerStopResult = {
  success: boolean;
  sessionId: string;
  startedAt: string;
  stoppedAt: string;
  durationSeconds: number;
};

interface Window {
  api: {
    auth: {
      get: () => Promise<AuthState>;
      login: (payload: LoginPayload) => Promise<{ success: boolean; siteUrl: string }>;
      logout: () => Promise<{ success: boolean }>;
    };
    tracker: {
      start: (payload: TrackerStartPayload) => Promise<TrackerStartResult>;
      stop: () => Promise<TrackerStopResult>;
    };
    user: {
      getLoggedUser: () => Promise<string>;
    };
    projects: {
      get: () => Promise<Project[]>;
    };
    activities: {
      create: (payload: ActivityInput) => Promise<ActivityRecord>;
      prompt: (payload: ActivityPromptInput) => Promise<ActivityRecord | null>;
    };
    settings: {
      get: () => Promise<AppSettings>;
    };
  };
}
