import React from 'react'

export const BiActivityGauge: React.FC<{
  title?: string
  score?: number
  maxScore?: number
  statusLabel?: string
}> = ({
  title = 'System Reliability & Uptime Score',
  score = 99.94,
  maxScore = 100,
  statusLabel = 'Optimal'
}) => {
  return (
    <div className="card bg-base-100 p-6 border border-base-300 shadow-sm text-center">
      <h3 className="font-bold text-base mb-4">{title}</h3>
      <div className="radial-progress text-success mx-auto" style={{ '--value': score, '--size': '8.5rem', '--thickness': '0.9rem' } as any}>
        <div>
          <span className="text-2xl font-black">{score}%</span>
          <span className="block text-[10px] text-success font-semibold uppercase">{statusLabel}</span>
        </div>
      </div>
      <p className="text-xs opacity-60 mt-4">Calculated over 30 days rolling SLA window</p>
    </div>
  )
}
