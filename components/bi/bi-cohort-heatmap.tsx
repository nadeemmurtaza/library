import React from 'react'

export const BiCohortHeatmap: React.FC = () => {
  const cohorts = [
    { cohort: 'Jan 2026', size: '1,420', ret: [100, 78, 65, 54, 49, 45] },
    { cohort: 'Feb 2026', size: '1,680', ret: [100, 82, 69, 58, 52] },
    { cohort: 'Mar 2026', size: '1,950', ret: [100, 85, 72, 61] },
    { cohort: 'Apr 2026', size: '2,240', ret: [100, 88, 76] },
    { cohort: 'May 2026', size: '2,510', ret: [100, 90] },
    { cohort: 'Jun 2026', size: '2,890', ret: [100] },
  ]

  const getColor = (val: number) => {
    if (val >= 80) return 'bg-emerald-600 text-white'
    if (val >= 60) return 'bg-emerald-500 text-white'
    if (val >= 40) return 'bg-emerald-400 text-gray-900'
    return 'bg-emerald-200 text-gray-900'
  }

  return (
    <div className="card bg-base-100 p-6 border border-base-300 shadow-sm overflow-x-auto">
      <h3 className="font-bold text-lg mb-1">User Retention Cohorts</h3>
      <p className="text-xs opacity-60 mb-6">Percentage of active accounts returning week-over-week</p>
      <table className="table table-xs w-full text-center">
        <thead>
          <tr className="border-b border-base-300">
            <th className="text-left">Cohort</th>
            <th>Users</th>
            <th>W0</th>
            <th>W1</th>
            <th>W2</th>
            <th>W3</th>
            <th>W4</th>
            <th>W5</th>
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c, i) => (
            <tr key={i} className="border-b border-base-200">
              <td className="text-left font-bold">{c.cohort}</td>
              <td className="opacity-70 font-mono">{c.size}</td>
              {c.ret.map((r, idx) => (
                <td key={idx}>
                  <span className={`inline-block w-10 py-1 rounded text-[11px] font-bold ${getColor(r)}`}>
                    {r}%
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
