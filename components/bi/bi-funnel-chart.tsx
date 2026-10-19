import React from 'react'

export const BiFunnelChart: React.FC = () => {
  const stages = [
    { name: 'Website Visitors', count: '142,000', drop: '100%' },
    { name: 'Product Signups', count: '28,400', drop: '20%' },
    { name: 'Activated Workspaces', count: '14,200', drop: '10%' },
    { name: 'Trial Started', count: '7,100', drop: '5%' },
    { name: 'Paid Customers', count: '3,550', drop: '2.5%' }
  ]

  return (
    <div className="card bg-base-100 p-6 border border-base-300 shadow-sm">
      <h3 className="font-bold text-lg mb-1">Conversion Funnel</h3>
      <p className="text-xs opacity-60 mb-6">Drop-off rate across user onboarding lifecycle</p>
      <div className="space-y-3">
        {stages.map((st, i) => (
          <div key={i} className="flex items-center gap-4 text-xs">
            <div className="w-36 font-semibold truncate">{st.name}</div>
            <div className="flex-1 bg-base-200 rounded h-6 relative overflow-hidden">
              <div
                className="bg-primary/80 h-full rounded transition-all duration-500"
                style={{ width: st.drop }}
              />
            </div>
            <div className="w-16 font-mono font-bold text-right">{st.count}</div>
            <div className="w-12 text-right opacity-60">{st.drop}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
