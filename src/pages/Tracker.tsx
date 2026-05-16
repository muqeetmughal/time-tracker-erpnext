import { Play, Square } from 'lucide-react'
import Field from '../components/Field'

type Project = {
  name: string
  project_name: string
}

type Task = {
  name: string
  subject: string
}

type TrackerProps = {
  running: boolean
  seconds: number
  sessionId: string
  project: string
  setProject: (value: string) => void
  task: string
  setTask: (value: string) => void
  activityType: string
  setActivityType: (value: string) => void
  projects: Project[]
  tasks: Task[]
  onStartTracking: () => void
  onStopTracking: () => void
  onLoadTasks: (projectName: string) => void
}

export default function Tracker({
  running,
  seconds,
  sessionId,
  project,
  setProject,
  task,
  setTask,
  activityType,
  setActivityType,
  projects,
  tasks,
  onStartTracking,
  onStopTracking,
  onLoadTasks,
}: TrackerProps) {
  function formatTime(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60

    return [h, m, s]
      .map((v) => String(v).padStart(2, '0'))
      .join(':')
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-2 text-4xl font-bold">
        Time Tracker
      </h1>

      <p className="mb-8 text-slate-400">
        Select project and task, then start tracking.
      </p>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
        <div className="mb-8 rounded-3xl bg-slate-950 p-8 text-center">
          <div className="text-sm uppercase tracking-widest text-slate-500">
            Session Timer
          </div>

          <div className="mt-3 text-7xl font-bold">
            {formatTime(seconds)}
          </div>

          <div className="mt-3 text-slate-400">
            {running ? 'Tracking in progress' : 'Ready to start'}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Field label="Project">
            <select
              disabled={running}
              value={project}
              onChange={(e) => onLoadTasks(e.target.value)}
              className="input"
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.project_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Task">
            <select
              disabled={running}
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="input"
            >
              <option value="">Select Task</option>
              {tasks.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.subject}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Activity Type">
            <select
              disabled={running}
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="input"
            >
              <option>Development</option>
              <option>Communication</option>
              <option>Testing</option>
              <option>Support</option>
              <option>Meeting</option>
            </select>
          </Field>

          <Field label="Session ID">
            <input
              disabled
              value={sessionId || 'Not started'}
              className="input text-slate-400"
            />
          </Field>
        </div>

        <div className="mt-8 flex gap-4">
          {!running ? (
            <button
              onClick={onStartTracking}
              className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-green-600 px-6 py-4 text-lg font-semibold transition hover:bg-green-500"
            >
              <Play size={22} />
              Start Tracking
            </button>
          ) : (
            <button
              onClick={onStopTracking}
              className="flex flex-1 items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-4 text-lg font-semibold transition hover:bg-red-500"
            >
              <Square size={22} />
              Stop Tracking
            </button>
          )}
        </div>
      </div>
    </div>
  )
}