export default function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
        {icon}
      </div>

      <div className="text-sm text-slate-400">
        {title}
      </div>

      <div className="mt-2 text-3xl font-bold">
        {value}
      </div>
    </div>
  )
}