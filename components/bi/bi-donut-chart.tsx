import React from 'react'

export const BiDonutChart: React.FC<{
  title?: string
  segments?: { label: string; percent: number; colorClass: string }[]
}> = ({
  title = 'Revenue by Channel',
  segments = [
    { label: 'Direct Sales', percent: 54, colorClass: 'bg-primary text-primary' },
    { label: 'Marketplace', percent: 28, colorClass: 'bg-secondary text-secondary' },
    { label: 'Referral', percent: 18, colorClass: 'bg-accent text-accent' }
  ]
}) => {
  return (
    <div className="card bg-base-100 p-6 border border-base-300 shadow-sm">
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
        <div className="radial-progress text-primary relative" style={{ '--value': 75, '--size': '9rem', '--thickness': '1.2rem' } as any}>
          <div className="text-center">
            <span className="text-xl font-extrabold">$248k</span>
            <span className="block text-[10px] opacity-50 uppercase">Total</span>
          </div>
        </div>
        <div className="space-y-2 w-full sm:w-auto">
          {segments.map((s, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${s.colorClass.split(' ')[0]}`} />
                <span>{s.label}</span>
              </div>
              <span className="font-bold">{s.percent}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
