export type Credentials = {
  siteUrl: string;
  apiKey: string;
  apiSecret: string;
};

export type AppStore = {
  credentials?: Credentials;
};

export type FrappeListResponse<T> = {
  data: T[];
};

export type FrappeMethodResponse<T> = {
  message: T;
};

export type ActivityType = "start" | "stop";

export type ActivityInput = {
  project: string;
  type: ActivityType;
  description: string;
  sessionId?: string;
  createdAt?: string;
};

export type ActivityRecord = Required<ActivityInput> & {
  id: number;
};

export type ActivityPromptInput = Omit<ActivityInput, "description"> & {
  title: string;
  projectLabel?: string;
};

export type AppSettings = {
  screenshot_frequency_seconds: number;
  idle_timeout_minutes: number;
  popup_frequency_minutes: number;
  auto_submit_timesheet: boolean;
};

export type TrackerStartPayload = {
  project: string;
  description: string;
};

export type TrackerStartResult = {
  success: boolean;
  sessionId: string;
  startedAt: string;
};

export type TrackerStopResult = {
  success: boolean;
  sessionId: string;
  startedAt: string;
  stoppedAt: string;
  durationSeconds: number;
};
