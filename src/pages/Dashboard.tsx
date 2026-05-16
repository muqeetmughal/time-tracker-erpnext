import { Activity, Clock, Monitor, Timer } from 'lucide-react'
import StatCard from '../components/StatCard'

type Project = {
  name: string
  project_name: string
}

type Task = {
  name: string
  subject: string
}

type DashboardProps = {
  running: boolean
  seconds: number
  project: string
  task: string
  activityType: string
  projects: Project[]
  tasks: Task[]
}

export default function Dashboard({
  running,
  seconds,
  project,
  task,
  activityType,
  projects,
  tasks,
}: DashboardProps) {
  function formatTime(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60

    return [h, m, s]
      .map((v) => String(v).padStart(2, '0'))
      .join(':')
  }

  const selectedProject = projects.find((p) => p.name === project)
  const selectedTask = tasks.find((t) => t.name === task)

  return (
    <div>
      <h1 className="mb-2 text-4xl font-bold">
        Dashboard
      </h1>

      <p className="mb-8 text-slate-400">
        Overview of today's work activity.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Hours"
          value={formatTime(seconds)}
          icon={<Clock />}
        />

        <StatCard
          title="Activity"
          value={running ? '82%' : '0%'}
          icon={<Activity />}
        />

        <StatCard
          title="Screenshots"
          value={running ? '12' : '0'}
          icon={<Monitor />}
        />

        <StatCard
          title="Status"
          value={running ? 'Active' : 'Idle'}
          icon={<Timer />}
        />
      </div>

      <div className="mt-8 rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-4 text-2xl font-bold">
          Active Work
        </h2>

        {running ? (
          <div className="space-y-3 text-slate-300">
            <p>
              <span className="text-slate-500">Project:</span>{' '}
              {selectedProject?.project_name || project}
            </p>

            <p>
              <span className="text-slate-500">Task:</span>{' '}
              {selectedTask?.subject || task || 'No task selected'}
            </p>

            <p>
              <span className="text-slate-500">Activity:</span>{' '}
              {activityType}
            </p>
          </div>
        ) : (
          <p className="text-slate-400">
            No active tracking session.
          </p>
        )}
      </div>
    </div>
  )
}