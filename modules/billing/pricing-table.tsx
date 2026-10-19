import React from 'react'

export const PricingTable: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <div className="card bg-base-100 p-6 border border-base-300">
        <h3 className="font-bold text-lg">Starter</h3>
        <div className="text-3xl font-extrabold my-2">$19<span className="text-sm font-normal opacity-60">/mo</span></div>
        <button className="btn btn-primary btn-sm mt-4">Select Starter</button>
      </div>
      <div className="card bg-base-100 p-6 border-2 border-primary shadow-lg">
        <span className="badge badge-primary badge-sm w-fit">Most Popular</span>
        <h3 className="font-bold text-lg mt-2">Professional</h3>
        <div className="text-3xl font-extrabold my-2">$49<span className="text-sm font-normal opacity-60">/mo</span></div>
        <button className="btn btn-primary btn-sm mt-4">Select Pro</button>
      </div>
      <div className="card bg-base-100 p-6 border border-base-300">
        <h3 className="font-bold text-lg">Enterprise</h3>
        <div className="text-3xl font-extrabold my-2">$199<span className="text-sm font-normal opacity-60">/mo</span></div>
        <button className="btn btn-outline btn-sm mt-4">Contact Sales</button>
      </div>
    </div>
  )
}
