import React from 'react'

export interface MetricsCardProps {
  label: string
  value: string | number
  delta?: string
  trend?: 'up' | 'down' | 'neutral'
}

export const MetricsCard: React.FC<MetricsCardProps> = ({ label, value, delta, trend = 'up' }) => {
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'opacity-60'
  return (
    <div className="card bg-base-100 p-4 border border-base-300">
      <span className="text-xs font-semibold opacity-60 uppercase">{label}</span>
      <div className="text-2xl font-bold mt-1">{value}</div>
      {delta && <div className={`text-xs font-medium mt-2 ${trendColor}`}>{delta}</div>}
    </div>
  )
}
