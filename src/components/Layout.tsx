import { LayoutDashboard, LogOut, Settings, Timer } from 'lucide-react'

type Page = 'dashboard' | 'tracker' | 'settings'

type LayoutProps = {
  children: React.ReactNode
  currentPage: Page
  onNavigate: (page: Page) => void
  running: boolean
  onLogout: () => void
}

export default function Layout({
  children,
  currentPage,
  onNavigate,
  running,
  onLogout,
}: LayoutProps) {
  const nav = [
    {
      id: 'dashboard' as Page,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'tracker' as Page,
      label: 'Tracker',
      icon: Timer,
    },
    {
      id: 'settings' as Page,
      label: 'Settings',
      icon: Settings,
    },
  ]

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <aside className="w-72 border-r border-slate-800 bg-slate-900 p-5">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
            <Timer size={24} />
          </div>

          <div>
            <div className="text-xl font-bold">
              ERP Tracker
            </div>
            <div className="text-xs text-slate-400">
              Infintrix Technologies
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {nav.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  currentPage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div className="text-sm text-slate-400">
            Current Status
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${
                running ? 'bg-green-500' : 'bg-slate-500'
              }`}
            />
            <span className="font-semibold">
              {running ? 'Tracking' : 'Idle'}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="mt-8 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}