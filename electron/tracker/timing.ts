import type { AppConfig } from "../types";

export function getNextCaptureDelay(config: AppConfig) {
  const intervalMs = config.general.trackingIntervalMinutes * 60 * 1000;

  if (!config.advanced.randomizedTracking) {
    return intervalMs;
  }

  return Math.max(60_000, Math.floor(Math.random() * intervalMs));
}
