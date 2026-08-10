export function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="card stat-card">
      <span className="stat-icon">
        <Icon size={18} />
      </span>
      <div className="stack gap-1">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
        {hint && <span className="text-xs subtle">{hint}</span>}
      </div>
    </div>
  )
}
