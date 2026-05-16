export default function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm text-slate-400">
        {label}
      </div>

      {children}
    </label>
  )
}