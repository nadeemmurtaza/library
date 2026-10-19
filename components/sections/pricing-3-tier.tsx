import React, { useState } from 'react'

export const Pricing3Tier: React.FC = () => {
  const [annual, setAnnual] = useState(true)

  return (
    <section className="py-20 max-w-7xl mx-auto px-4">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-extrabold">Simple, transparent pricing</h2>
        <p className="mt-3 opacity-70">Choose the perfect tier for your team size and infrastructure requirements.</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className={`text-sm ${!annual ? 'font-bold' : 'opacity-60'}`}>Monthly</span>
          <input type="checkbox" className="toggle toggle-primary" checked={annual} onChange={(e) => setAnnual(e.target.checked)} />
          <span className={`text-sm ${annual ? 'font-bold' : 'opacity-60'}`}>Annual <span className="badge badge-sm badge-success font-semibold">Save 20%</span></span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="card bg-base-100 p-8 border border-base-300">
          <h3 className="font-bold text-xl">Starter</h3>
          <p className="text-xs opacity-60 mt-1">For independent developers & prototypes</p>
          <div className="text-4xl font-extrabold my-6">${annual ? '19' : '24'}<span className="text-sm font-normal opacity-60">/mo</span></div>
          <button className="btn btn-outline btn-block">Get Started</button>
        </div>
        <div className="card bg-base-100 p-8 border-2 border-primary shadow-xl relative">
          <span className="badge badge-primary absolute -top-3 right-8 font-bold">Recommended</span>
          <h3 className="font-bold text-xl">Professional</h3>
          <p className="text-xs opacity-60 mt-1">For growing teams and production apps</p>
          <div className="text-4xl font-extrabold my-6">${annual ? '49' : '59'}<span className="text-sm font-normal opacity-60">/mo</span></div>
          <button className="btn btn-primary btn-block">Start Pro Trial</button>
        </div>
        <div className="card bg-base-100 p-8 border border-base-300">
          <h3 className="font-bold text-xl">Enterprise</h3>
          <p className="text-xs opacity-60 mt-1">Dedicated compute, SSO, & custom SLAs</p>
          <div className="text-4xl font-extrabold my-6">${annual ? '199' : '249'}<span className="text-sm font-normal opacity-60">/mo</span></div>
          <button className="btn btn-outline btn-block">Contact Sales</button>
        </div>
      </div>
    </section>
  )
}
