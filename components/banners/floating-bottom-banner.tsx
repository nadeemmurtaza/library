import React, { useState } from 'react'

export const FloatingBottomBanner: React.FC<{ title?: string; subtitle?: string; actionText?: string }> = ({
  title = 'Ready to upgrade your workflow?',
  subtitle = 'Join 380,000+ designers and developers using Untitled UI today.',
  actionText = 'Start 14-day Free Trial'
}) => {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  return (
    <div className="fixed bottom-4 inset-x-4 max-w-4xl mx-auto z-50 card bg-base-100 shadow-2xl border border-base-300 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-5">
      <div>
        <h4 className="font-bold text-base text-base-content">{title}</h4>
        <p className="text-xs opacity-70 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <button onClick={() => setDismissed(true)} className="btn btn-sm btn-ghost">Dismiss</button>
        <button className="btn btn-sm btn-primary">{actionText}</button>
      </div>
    </div>
  )
}
