export default function MetricCard({ title, value, icon, change, color = 'blue' }) {
  const colorClass = `metric-card-${color}`;

  return (
    <div className={`metric-card ${colorClass}`}>
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <div className="metric-value">{value}</div>
        <div className="metric-title">{title}</div>
        {change !== undefined && (
          <div className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}
