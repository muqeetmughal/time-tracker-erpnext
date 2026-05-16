import Field from '../components/Field'

type SettingsProps = {
  screenshotFrequency: number
  setScreenshotFrequency: (value: number) => void
  idleTimeout: number
  setIdleTimeout: (value: number) => void
  autoSubmit: boolean
  setAutoSubmit: (value: boolean) => void
}

export default function Settings({
  screenshotFrequency,
  setScreenshotFrequency,
  idleTimeout,
  setIdleTimeout,
  autoSubmit,
  setAutoSubmit,
}: SettingsProps) {
  return (
    <div className="max-w-4xl">
      <h1 className="mb-2 text-4xl font-bold">
        Settings
      </h1>

      <p className="mb-8 text-slate-400">
        Configure tracker behavior.
      </p>

      <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <Field label="Screenshot Frequency Seconds">
          <input
            type="number"
            value={screenshotFrequency}
            onChange={(e) =>
              setScreenshotFrequency(Number(e.target.value))
            }
            className="input"
          />
        </Field>

        <Field label="Idle Timeout Minutes">
          <input
            type="number"
            value={idleTimeout}
            onChange={(e) =>
              setIdleTimeout(Number(e.target.value))
            }
            className="input"
          />
        </Field>

        <div className="flex items-center justify-between rounded-2xl bg-slate-950 p-5">
          <div>
            <div className="font-semibold">
              Auto Submit Timesheets
            </div>

            <div className="text-sm text-slate-400">
              Submit ERPNext Timesheet automatically when session stops.
            </div>
          </div>

          <input
            checked={autoSubmit}
            onChange={(e) => setAutoSubmit(e.target.checked)}
            type="checkbox"
            className="h-5 w-5"
          />
        </div>

        <button className="rounded-2xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500">
          Save Settings
        </button>
      </div>
    </div>
  )
}