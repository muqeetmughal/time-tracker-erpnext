export type Credentials = {
  siteUrl: string;
  apiKey: string;
  apiSecret: string;
};

export type AppStore = {
  credentials?: Credentials;
  config?: AppConfig;
};

export type FrappeListResponse<T> = {
  data: T[];
};

export type FrappeMethodResponse<T> = {
  message: T;
};

export type ActivityType = "start" | "stop";
export type ActivityMediaType = "screenshot" | "camshot";
export type ActivityMediaFilter = ActivityMediaType | "all";
export type ActivityMediaUploadStatus = "pending" | "uploading" | "uploaded" | "failed";
export type ActivitySessionStatus = "active" | "idle" | "stopped";
export type ActivityTimelineType =
  | "tracking_started"
  | "screenshot_taken"
  | "camshot_taken"
  | "idle_started"
  | "idle_ended"
  | "tracking_stopped";

export type ActivityInput = {
  project: string;
  type: ActivityType;
  description: string;
  sessionId?: string;
  createdAt?: string;
  screenshotPaths?: string[];
  camshotPaths?: string[];
};

export type ActivityRecord = {
  id: number;
  project: string;
  type: ActivityType;
  description: string;
  sessionId: string;
  createdAt: string;
  screenshotPaths: string[];
  camshotPaths: string[];
  synced: boolean;
  syncStatus: "pending" | "syncing" | "synced" | "failed";
  remoteId: string;
  uploadedAt: string;
  syncedAt: string;
  uploadError: string;
};

export type ActivityMediaRecord = {
  id: number;
  activityId: number;
  mediaType: ActivityMediaType;
  filePath: string;
  previewDataUrl?: string;
  uploadStatus: ActivityMediaUploadStatus;
  remoteId: string;
  uploadedAt: string;
  uploadError: string;
  createdAt: string;
  project: string;
  activityType: ActivityType;
  description: string;
};

export type ActivitySessionRecord = {
  id: string;
  projectId: string;
  taskId: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: ActivitySessionStatus;
};

export type ActivitySessionSummaryRecord = ActivitySessionRecord & {
  screenshotCount: number;
  camshotCount: number;
  keyboardCount: number;
  mouseClickCount: number;
};

export type ActivitySessionMediaInput = {
  sessionId: string;
  mediaType: ActivityMediaType;
  filePath: string;
  timestamp: string;
  approved: boolean;
  rejected: boolean;
  cameraId?: string;
};

export type ActivityTimelineInput = {
  sessionId: string;
  type: ActivityTimelineType;
  timestamp?: string;
  imageId?: number;
};

export type InputActivityKind = "keyboard" | "mouse";

export type InputActivityInput = {
  sessionId: string;
  kind: InputActivityKind;
  timestamp: string;
  count: number;
};

export type IdlePeriodInput = {
  sessionId: string;
  startTime: string;
  endTime?: string;
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

export type MinuteInterval = 1 | 5 | 10 | 15 | 30 | 45 | 60;
export type OptionalMinuteInterval = MinuteInterval | null;
export type ScreenshotReviewSeconds = 5 | 10 | 15 | 30 | 60;
export type ScreenshotsFrom = "primary" | "all";

export type AppConfig = {
  general: {
    trackingIntervalMinutes: MinuteInterval;
    activityUpdateIntervalMinutes: OptionalMinuteInterval;
    idleTimeoutMinutes: OptionalMinuteInterval;
    takeScreenshots: boolean;
    takeCamshots: boolean;
    resumeTrackingAfterIdle: boolean;
    reviewImagesBeforeUpload: boolean;
  };
  advanced: {
    screenshotReviewSeconds: ScreenshotReviewSeconds;
    randomizedTracking: boolean;
    activityAutoComplete: boolean;
    askActivityDescriptionOnTrackingStart: boolean;
    askActivityDescriptionOnTrackingStop: boolean;
  };
  trackingSources: {
    countKeyboardHits: boolean;
    countMouseClicks: boolean;
    screenshotsFrom: ScreenshotsFrom;
    cameraId: string;
    cameraName: string;
  };
  other: {
    playSounds: boolean;
    showDockIcon: boolean;
    openAtLogin: boolean;
  };
};

export type DeepPartial<T> = {
  [Key in keyof T]?: T[Key] extends object ? DeepPartial<T[Key]> : T[Key];
};

export type TrackerStartPayload = {
  project: string;
  taskId?: string;
  description: string;
};

export type TrackerStartResult = {
  success: boolean;
  sessionId: string;
  startedAt: string;
  status: ActivitySessionStatus;
};

export type TrackerStopResult = {
  success: boolean;
  sessionId: string;
  startedAt: string;
  stoppedAt: string;
  durationSeconds: number;
  status: ActivitySessionStatus;
};

export type TrackerStatusResult = {
  isTracking: boolean;
  sessionId: string;
  project: string;
  description: string;
  startedAt: string;
  status: ActivitySessionStatus | "";
};
