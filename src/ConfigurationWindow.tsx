import { useEffect, useState } from "react";

type Tab = "general" | "advanced" | "sources" | "other";

type CameraOption = {
  deviceId: string;
  label: string;
};

const minuteOptions: Array<{ label: string; value: MinuteInterval }> = [
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
];

const optionalMinuteOptions: Array<{
  label: string;
  value: OptionalMinuteInterval;
}> = [...minuteOptions, { label: "Never", value: null }];

const reviewTimeOptions: Array<{
  label: string;
  value: ScreenshotReviewSeconds;
}> = [
  { label: "5 seconds", value: 5 },
  { label: "10 seconds", value: 10 },
  { label: "15 seconds", value: 15 },
  { label: "30 seconds", value: 30 },
  { label: "60 seconds", value: 60 },
];

function parseOptionalMinute(value: string): OptionalMinuteInterval {
  return value === "never" ? null : (Number(value) as MinuteInterval);
}

function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-[#3ab175]"
      />
    </label>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-48 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ConfigurationWindow() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [cameras, setCameras] = useState<CameraOption[]>([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const loadedConfig = await window.api.config.get();
        setConfig(loadedConfig);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Could not load configuration.",
        );
      }
    }

    loadConfig();
    refreshCameras();
  }, []);

  async function refreshCameras() {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        stream.getTracks().forEach((track) => track.stop());
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      setCameras(
        devices
          .filter((device) => device.kind === "videoinput")
          .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${index + 1}`,
          })),
      );
    } catch (cameraError) {
      console.error("Failed to refresh cameras:", cameraError);
      setCameras([]);
    }
  }

  async function save(partialConfig: DeepPartial<AppConfig>) {
    try {
      setError("");
      const savedConfig = await window.api.config.save(partialConfig);
      setConfig(savedConfig);
      setStatus("Saved");
      window.setTimeout(() => setStatus(""), 1200);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save configuration.",
      );
    }
  }

  async function reset() {
    try {
      const savedConfig = await window.api.config.reset();
      setConfig(savedConfig);
      setStatus("Reset");
      window.setTimeout(() => setStatus(""), 1200);
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? resetError.message
          : "Could not reset configuration.",
      );
    }
  }

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f4f4] font-sans text-sm text-gray-500">
        Loading configuration...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] p-5 font-sans text-[#555555]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-normal text-gray-700">Configuration</h1>
          <p className="text-xs text-gray-400">Local tracking preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {status && <span className="text-xs text-emerald-600">{status}</span>}
          <button
            onClick={reset}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm hover:border-gray-400"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mb-4 flex rounded border border-gray-200 bg-white p-1 shadow-sm">
        {[
          ["general", "General"],
          ["advanced", "Advanced"],
          ["sources", "Tracking Sources"],
          ["other", "Other"],
        ].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as Tab)}
            className={`flex-1 rounded px-3 py-2 text-sm transition-colors ${
              activeTab === tab
                ? "bg-[#3ab175] text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {activeTab === "general" && (
          <>
            <SelectRow
              label="Tracking Interval"
              value={String(config.general.trackingIntervalMinutes)}
              options={minuteOptions.map((option) => ({
                label: option.label,
                value: String(option.value),
              }))}
              onChange={(value) =>
                save({
                  general: {
                    trackingIntervalMinutes: Number(value) as MinuteInterval,
                  },
                })
              }
            />
            <SelectRow
              label="Activity Update Interval"
              value={
                config.general.activityUpdateIntervalMinutes === null
                  ? "never"
                  : String(config.general.activityUpdateIntervalMinutes)
              }
              options={optionalMinuteOptions.map((option) => ({
                label: option.label,
                value: option.value === null ? "never" : String(option.value),
              }))}
              onChange={(value) =>
                save({
                  general: {
                    activityUpdateIntervalMinutes: parseOptionalMinute(value),
                  },
                })
              }
            />
            <SelectRow
              label="Idle Timeout"
              value={
                config.general.idleTimeoutMinutes === null
                  ? "never"
                  : String(config.general.idleTimeoutMinutes)
              }
              options={optionalMinuteOptions.map((option) => ({
                label: option.label,
                value: option.value === null ? "never" : String(option.value),
              }))}
              onChange={(value) =>
                save({
                  general: {
                    idleTimeoutMinutes: parseOptionalMinute(value),
                  },
                })
              }
            />
            <CheckboxRow
              label="Take Screenshots"
              checked={config.general.takeScreenshots}
              onChange={(checked) =>
                save({ general: { takeScreenshots: checked } })
              }
            />
            <CheckboxRow
              label="Take Camshots"
              checked={config.general.takeCamshots}
              onChange={(checked) =>
                save({ general: { takeCamshots: checked } })
              }
            />
            <CheckboxRow
              label="Resume Tracking After Idle"
              checked={config.general.resumeTrackingAfterIdle}
              onChange={(checked) =>
                save({ general: { resumeTrackingAfterIdle: checked } })
              }
            />
            <CheckboxRow
              label="Review Images Before Upload"
              checked={config.general.reviewImagesBeforeUpload}
              onChange={(checked) =>
                save({ general: { reviewImagesBeforeUpload: checked } })
              }
            />
          </>
        )}

        {activeTab === "advanced" && (
          <>
            <SelectRow
              label="Screenshot Review Time"
              value={String(config.advanced.screenshotReviewSeconds)}
              options={reviewTimeOptions.map((option) => ({
                label: option.label,
                value: String(option.value),
              }))}
              onChange={(value) =>
                save({
                  advanced: {
                    screenshotReviewSeconds:
                      Number(value) as ScreenshotReviewSeconds,
                  },
                })
              }
            />
            <CheckboxRow
              label="Randomized Tracking"
              checked={config.advanced.randomizedTracking}
              onChange={(checked) =>
                save({ advanced: { randomizedTracking: checked } })
              }
            />
            <CheckboxRow
              label="Activity Auto Complete"
              checked={config.advanced.activityAutoComplete}
              onChange={(checked) =>
                save({ advanced: { activityAutoComplete: checked } })
              }
            />
            <CheckboxRow
              label="Ask for Activity Description: On Tracking Start"
              checked={config.advanced.askActivityDescriptionOnTrackingStart}
              onChange={(checked) =>
                save({
                  advanced: {
                    askActivityDescriptionOnTrackingStart: checked,
                  },
                })
              }
            />
            <CheckboxRow
              label="Ask for Activity Description: On Tracking Stop"
              checked={config.advanced.askActivityDescriptionOnTrackingStop}
              onChange={(checked) =>
                save({
                  advanced: {
                    askActivityDescriptionOnTrackingStop: checked,
                  },
                })
              }
            />
          </>
        )}

        {activeTab === "sources" && (
          <>
            <CheckboxRow
              label="Count Keyboard Hits"
              checked={config.trackingSources.countKeyboardHits}
              onChange={(checked) =>
                save({ trackingSources: { countKeyboardHits: checked } })
              }
            />
            <CheckboxRow
              label="Count Mouse Clicks"
              checked={config.trackingSources.countMouseClicks}
              onChange={(checked) =>
                save({ trackingSources: { countMouseClicks: checked } })
              }
            />
            <SelectRow
              label="Take Screenshots From"
              value={config.trackingSources.screenshotsFrom}
              options={[
                { label: "Primary Monitor", value: "primary" },
                { label: "All Monitors", value: "all" },
              ]}
              onChange={(value) =>
                save({
                  trackingSources: {
                    screenshotsFrom: value as ScreenshotsFrom,
                  },
                })
              }
            />
            <label className="flex items-center justify-between gap-4 rounded border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm">
              <span>Camera</span>
              <div className="flex items-center gap-2">
                <select
                  value={config.trackingSources.cameraId}
                  onChange={(event) => {
                    const camera = cameras.find(
                      (item) => item.deviceId === event.target.value,
                    );

                    save({
                      trackingSources: {
                        cameraId: camera?.deviceId || "",
                        cameraName: camera?.label || "",
                      },
                    });
                  }}
                  className="w-48 rounded border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-400"
                >
                  <option value="">No camera selected</option>
                  {cameras.map((camera) => (
                    <option key={camera.deviceId} value={camera.deviceId}>
                      {camera.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={refreshCameras}
                  className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 hover:border-gray-400"
                >
                  Refresh
                </button>
              </div>
            </label>
          </>
        )}

        {activeTab === "other" && (
          <>
            <CheckboxRow
              label="Play Sounds"
              checked={config.other.playSounds}
              onChange={(checked) => save({ other: { playSounds: checked } })}
            />
            <CheckboxRow
              label="Show Dock Icon"
              checked={config.other.showDockIcon}
              onChange={(checked) => save({ other: { showDockIcon: checked } })}
            />
            <CheckboxRow
              label="Open At Login"
              checked={config.other.openAtLogin}
              onChange={(checked) => save({ other: { openAtLogin: checked } })}
            />
          </>
        )}
      </div>
    </div>
  );
}
