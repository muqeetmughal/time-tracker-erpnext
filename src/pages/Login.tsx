import { Timer } from 'lucide-react'

type LoginProps = {
  siteUrl: string
  setSiteUrl: (value: string) => void
  apiKey: string
  setApiKey: (value: string) => void
  apiSecret: string
  setApiSecret: (value: string) => void
  onLogin: () => void
}

export default function Login({
  siteUrl,
  setSiteUrl,
  apiKey,
  setApiKey,
  apiSecret,
  setApiSecret,
  onLogin,
}: LoginProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="mb-8">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600">
            <Timer size={28} />
          </div>

          <h1 className="text-3xl font-bold">
            ERPNext Time Tracker
          </h1>

          <p className="mt-2 text-slate-400">
            Connect your ERPNext account to start tracking work.
          </p>
        </div>

        <div className="space-y-4">
          <input
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="ERPNext Site URL"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="API Key"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
          />

          <input
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            placeholder="API Secret"
            type="password"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 outline-none focus:border-blue-500"
          />

          <button
            onClick={onLogin}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold transition hover:bg-blue-500"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  )
}