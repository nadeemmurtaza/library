import React, { useState } from 'react'

export const BiLineChart: React.FC<{ title?: string }> = ({ title = 'Revenue & Volume Trend' }) => {
  const [range, setRange] = useState('30D')

  return (
    <div className="card bg-base-100 p-6 border border-base-300 shadow-sm">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="text-xs opacity-60">Consolidated transactional volume over selected interval</p>
        </div>
        <div className="join">
          {['7D', '30D', '90D', '1Y'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`join-item btn btn-xs ${range === r ? 'btn-primary' : 'btn-outline'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="h-64 w-full flex items-end gap-2 pt-6 border-b border-l border-base-300">
        {[35, 42, 48, 55, 60, 58, 67, 72, 85, 80, 92, 98].map((v, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center group relative h-full">
            <div
              className="w-full bg-primary/30 hover:bg-primary transition rounded-t"
              style={{ height: `${v}%` }}
            />
            <span className="text-[10px] opacity-40 mt-2 font-mono">M{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
