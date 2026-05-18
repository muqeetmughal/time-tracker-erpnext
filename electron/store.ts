import Store from "electron-store";
import { app } from "electron";
import type {
  AppConfig,
  AppStore,
  Credentials,
  DeepPartial,
  MinuteInterval,
  OptionalMinuteInterval,
  ScreenshotsFrom,
  ScreenshotReviewSeconds,
} from "./types";

export const store = new Store<AppStore>();

const minuteIntervals: MinuteInterval[] = [5, 10, 15, 30, 45, 60];
const optionalMinuteIntervals: OptionalMinuteInterval[] = [
  ...minuteIntervals,
  null,
];
const screenshotReviewSeconds: ScreenshotReviewSeconds[] = [5, 10, 15, 30, 60];
const screenshotSources: ScreenshotsFrom[] = ["primary", "all"];

export const defaultConfig: AppConfig = {
  general: {
    trackingIntervalMinutes: 15,
    activityUpdateIntervalMinutes: 30,
    idleTimeoutMinutes: 10,
    takeScreenshots: true,
    takeCamshots: false,
    resumeTrackingAfterIdle: true,
    reviewImagesBeforeUpload: false,
  },
  advanced: {
    screenshotReviewSeconds: 10,
    randomizedTracking: false,
    activityAutoComplete: false,
    askActivityDescriptionOnTrackingStart: true,
    askActivityDescriptionOnTrackingStop: true,
  },
  trackingSources: {
    countKeyboardHits: true,
    countMouseClicks: true,
    screenshotsFrom: "primary",
    cameraId: "",
    cameraName: "",
  },
  other: {
    playSounds: true,
    showDockIcon: true,
    openAtLogin: false,
  },
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeConfig<T extends Record<string, any>>(
  base: T,
  updates?: DeepPartial<T>,
): T {
  if (!updates) {
    return structuredClone(base);
  }

  const merged = structuredClone(base);

  for (const key of Object.keys(updates) as Array<keyof T>) {
    const updateValue = updates[key];

    if (updateValue === undefined) {
      continue;
    }

    if (isObject(merged[key]) && isObject(updateValue)) {
      merged[key] = mergeConfig(merged[key], updateValue as any) as T[keyof T];
    } else {
      merged[key] = updateValue as T[keyof T];
    }
  }

  return merged;
}

function assertOneOf<T>(
  label: string,
  value: unknown,
  allowedValues: readonly T[],
): asserts value is T {
  if (!allowedValues.includes(value as T)) {
    throw new Error(`Invalid ${label}.`);
  }
}

function assertBoolean(label: string, value: unknown): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid ${label}.`);
  }
}

export function validateConfig(config: AppConfig) {
  assertOneOf(
    "tracking interval",
    config.general.trackingIntervalMinutes,
    minuteIntervals,
  );
  assertOneOf(
    "activity update interval",
    config.general.activityUpdateIntervalMinutes,
    optionalMinuteIntervals,
  );
  assertOneOf(
    "idle timeout",
    config.general.idleTimeoutMinutes,
    optionalMinuteIntervals,
  );
  assertBoolean("take screenshots", config.general.takeScreenshots);
  assertBoolean("take camshots", config.general.takeCamshots);
  assertBoolean(
    "resume tracking after idle",
    config.general.resumeTrackingAfterIdle,
  );
  assertBoolean(
    "review images before upload",
    config.general.reviewImagesBeforeUpload,
  );
  assertOneOf(
    "screenshot review time",
    config.advanced.screenshotReviewSeconds,
    screenshotReviewSeconds,
  );
  assertBoolean("randomized tracking", config.advanced.randomizedTracking);
  assertBoolean(
    "activity auto complete",
    config.advanced.activityAutoComplete,
  );
  assertBoolean(
    "ask activity description on tracking start",
    config.advanced.askActivityDescriptionOnTrackingStart,
  );
  assertBoolean(
    "ask activity description on tracking stop",
    config.advanced.askActivityDescriptionOnTrackingStop,
  );
  assertBoolean("count keyboard hits", config.trackingSources.countKeyboardHits);
  assertBoolean("count mouse clicks", config.trackingSources.countMouseClicks);
  assertOneOf(
    "screenshots source",
    config.trackingSources.screenshotsFrom,
    screenshotSources,
  );
  assertBoolean("play sounds", config.other.playSounds);
  assertBoolean("show dock icon", config.other.showDockIcon);
  assertBoolean("open at login", config.other.openAtLogin);
}

export function applyConfigSideEffects(config: AppConfig) {
  if (app.isPackaged || config.other.openAtLogin) {
    try {
      app.setLoginItemSettings({
        openAtLogin: config.other.openAtLogin,
      });
    } catch (error) {
      console.warn("Unable to update login item settings:", error);
    }
  }

  if (process.platform === "darwin" && app.dock) {
    if (config.other.showDockIcon) {
      app.dock.show();
    } else {
      app.dock.hide();
    }
  }
}

export function getConfig(): AppConfig {
  const config = mergeConfig(defaultConfig, store.get("config"));

  validateConfig(config);
  return config;
}

export function saveConfig(partialConfig: DeepPartial<AppConfig>): AppConfig {
  const config = mergeConfig(getConfig(), partialConfig);

  validateConfig(config);
  store.set("config", config);
  applyConfigSideEffects(config);

  return config;
}

export function resetConfigToDefaults(): AppConfig {
  const config = structuredClone(defaultConfig);

  store.set("config", config);
  applyConfigSideEffects(config);

  return config;
}

export function normalizeSiteUrl(siteUrl: string) {
  return siteUrl.trim().replace(/\/+$/, "");
}

export function getCredentials() {
  const credentials = store.get("credentials");

  if (!credentials) {
    throw new Error("Please login first.");
  }

  return credentials;
}

export function saveCredentials(credentials: Credentials) {
  store.set("credentials", credentials);
}

export function clearCredentials() {
  store.delete("credentials");
}
