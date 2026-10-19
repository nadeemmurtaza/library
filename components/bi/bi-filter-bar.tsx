import React from 'react'

export const BiFilterBar: React.FC<{ onExport?: () => void }> = ({ onExport }) => {
  return (
    <div className="card bg-base-100 p-4 border border-base-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <select className="select select-sm select-bordered w-36">
          <option>All Regions</option>
          <option>North America</option>
          <option>Europe</option>
          <option>Asia Pacific</option>
        </select>
        <select className="select select-sm select-bordered w-36">
          <option>All Segments</option>
          <option>Enterprise</option>
          <option>Mid-Market</option>
          <option>SMB</option>
        </select>
        <select className="select select-sm select-bordered w-36">
          <option>Trailing 30 Days</option>
          <option>Trailing 90 Days</option>
          <option>Year to Date</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onExport} className="btn btn-sm btn-outline">Export CSV</button>
        <button className="btn btn-sm btn-primary">Apply Filters</button>
      </div>
    </div>
  )
}
