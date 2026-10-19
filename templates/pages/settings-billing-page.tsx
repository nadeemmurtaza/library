import React from 'react'

export const SettingsBillingPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-sm opacity-60">Manage your subscription tier, payment credentials, and invoices.</p>
      </div>

      <div className="card bg-base-100 p-6 border border-base-300">
        <div className="flex justify-between items-start">
          <div>
            <span className="badge badge-primary font-bold">Active Tier</span>
            <h3 className="text-xl font-bold mt-2">Professional Growth Plan</h3>
            <p className="text-xs opacity-60 mt-1">Renews on Nov 1, 2026 for $49/month</p>
          </div>
          <button className="btn btn-sm btn-outline">Change Plan</button>
        </div>
      </div>

      <div className="card bg-base-100 p-6 border border-base-300">
        <h3 className="font-bold text-lg mb-4">Payment Method</h3>
        <div className="flex items-center justify-between p-3 border border-base-200 rounded">
          <div className="flex items-center gap-3">
            <span className="badge badge-neutral">VISA</span>
            <div>
              <div className="font-mono text-sm font-bold">•••• •••• •••• 4242</div>
              <div className="text-xs opacity-60">Expires 12/28</div>
            </div>
          </div>
          <button className="btn btn-xs btn-outline">Edit</button>
        </div>
      </div>
    </div>
  )
}
