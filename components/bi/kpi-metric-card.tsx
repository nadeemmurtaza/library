import React from 'react'

export interface KpiMetricCardProps {
  title: string
  value: string | number
  deltaPercent: number
  deltaPeriod?: string
  trend?: 'up' | 'down' | 'neutral'
  sparklineData?: number[]
}

export const KpiMetricCard: React.FC<KpiMetricCardProps> = ({
  title,
  value,
  deltaPercent,
  deltaPeriod = 'vs last month',
  trend = deltaPercent >= 0 ? 'up' : 'down',
  sparklineData = [12, 19, 15, 22, 28, 25, 34, 40]
}) => {
  const isUp = trend === 'up'
  return (
    <div className="card bg-base-100 p-5 border border-base-300 shadow-sm hover:shadow transition">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold uppercase tracking-wider opacity-60">{title}</span>
        <span className={`badge badge-xs font-bold px-1.5 py-2 ${isUp ? 'badge-success text-success-content' : 'badge-error text-error-content'}`}>
          {isUp ? '↑' : '↓'} {Math.abs(deltaPercent)}%
        </span>
      </div>
      <div className="text-3xl font-extrabold mt-2 tracking-tight">{value}</div>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-xs opacity-50">{deltaPeriod}</span>
        {sparklineData && (
          <div className="flex items-end gap-1 h-6">
            {sparklineData.map((val, i) => (
              <div
                key={i}
                className="w-1.5 bg-primary/40 rounded-t"
                style={{ height: `${(val / Math.max(...sparklineData)) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
