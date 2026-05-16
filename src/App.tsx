import { useEffect, useState } from 'react'
import './index.css'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tracker from './pages/Tracker'
import Settings from './pages/Settings'
import Layout from './components/Layout'

type Page = 'login' | 'dashboard' | 'tracker' | 'settings'

type Project = {
  name: string
  project_name: string
}

type Task = {
  name: string
  subject: string
}

declare global {
  interface Window {
    tracker?: {
      start: (payload: any) => Promise<any>
      stop: (sessionId: string) => Promise<any>
      getProjects: () => Promise<Project[]>
      getTasks: (project: string) => Promise<Task[]>
      getSettings: () => Promise<any>
    }
  }
}

export default function App() {
  const [page, setPage] = useState<Page>('login')

  const [siteUrl, setSiteUrl] = useState('https://erp.infintrixtech.com')
  const [apiKey, setApiKey] = useState('')
  const [apiSecret, setApiSecret] = useState('')

  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  const [project, setProject] = useState('')
  const [task, setTask] = useState('')
  const [activityType, setActivityType] = useState('Development')

  const [running, setRunning] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [seconds, setSeconds] = useState(0)

  const [screenshotFrequency, setScreenshotFrequency] = useState(300)
  const [idleTimeout, setIdleTimeout] = useState(5)
  const [autoSubmit, setAutoSubmit] = useState(false)

  useEffect(() => {
    if (!running || !startedAt) return

    const interval = setInterval(() => {
      setSeconds(
        Math.floor((Date.now() - startedAt.getTime()) / 1000)
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [running, startedAt])

  async function login() {

    
    localStorage.setItem(
      'erpnext_tracker_credentials',
      JSON.stringify({
        siteUrl,
        apiKey,
        apiSecret,
      })
    )

    await loadProjects()
    setPage('dashboard')
  }

  async function loadProjects() {
    try {
      if (window.tracker?.getProjects) {
        const data = await window.tracker.getProjects()
        setProjects(data)
      } else {
        setProjects([
          {
            name: 'PROJ-0001',
            project_name: 'ERPNext Implementation',
          },
          {
            name: 'PROJ-0002',
            project_name: 'HRMS Development',
          },
        ])
      }
    } catch {
      setProjects([])
    }
  }

  async function loadTasks(projectName: string) {
    setProject(projectName)
    setTask('')

    try {
      if (window.tracker?.getTasks) {
        const data = await window.tracker.getTasks(projectName)
        setTasks(data)
      } else {
        setTasks([
          {
            name: 'TASK-0001',
            subject: 'Frontend Dashboard',
          },
          {
            name: 'TASK-0002',
            subject: 'Tracker API Integration',
          },
        ])
      }
    } catch {
      setTasks([])
    }
  }

  async function startTracking() {
    if (!project) {
      alert('Please select a project first.')
      return
    }

    const payload = {
      project,
      task,
      activityType,
    }

    let response: any

    if (window.tracker?.start) {
      response = await window.tracker.start(payload)
    } else {
      response = {
        success: true,
        sessionId: `local-${Date.now()}`,
      }
    }

    if (response?.success) {
      setSessionId(response.sessionId)
      setStartedAt(new Date())
      setSeconds(0)
      setRunning(true)
    }
  }

  async function stopTracking() {
    if (window.tracker?.stop && sessionId) {
      await window.tracker.stop(sessionId)
    }

    setRunning(false)
    setSessionId('')
    setStartedAt(null)
  }

  function logout() {
    localStorage.removeItem('erpnext_tracker_credentials')
    setPage('login')
  }

  if (page === 'login') {
    return (
      <Login
        siteUrl={siteUrl}
        setSiteUrl={setSiteUrl}
        apiKey={apiKey}
        setApiKey={setApiKey}
        apiSecret={apiSecret}
        setApiSecret={setApiSecret}
        onLogin={login}
      />
    )
  }

  return (
    <Layout
      currentPage={page}
      onNavigate={(p) => setPage(p)}
      running={running}
      onLogout={logout}
    >
      {page === 'dashboard' && (
        <Dashboard
          running={running}
          seconds={seconds}
          project={project}
          task={task}
          activityType={activityType}
          projects={projects}
          tasks={tasks}
        />
      )}

      {page === 'tracker' && (
        <Tracker
          running={running}
          seconds={seconds}
          sessionId={sessionId}
          project={project}
          setProject={setProject}
          task={task}
          setTask={setTask}
          activityType={activityType}
          setActivityType={setActivityType}
          projects={projects}
          tasks={tasks}
          onStartTracking={startTracking}
          onStopTracking={stopTracking}
          onLoadTasks={loadTasks}
        />
      )}

      {page === 'settings' && (
        <Settings
          screenshotFrequency={screenshotFrequency}
          setScreenshotFrequency={setScreenshotFrequency}
          idleTimeout={idleTimeout}
          setIdleTimeout={setIdleTimeout}
          autoSubmit={autoSubmit}
          setAutoSubmit={setAutoSubmit}
        />
      )}
    </Layout>
  )
}