import React from 'react'

export type BannerSeverity = 'info' | 'success' | 'warning' | 'error'

export const AlertStatusBanner: React.FC<{
  severity?: BannerSeverity
  title: string
  message?: string
  dismissible?: boolean
}> = ({ severity = 'info', title, message, dismissible = true }) => {
  const alertStyles = {
    info: 'alert-info text-info-content',
    success: 'alert-success text-success-content',
    warning: 'alert-warning text-warning-content',
    error: 'alert-error text-error-content'
  }

  return (
    <div role="alert" className={`alert ${alertStyles[severity]} shadow-sm rounded-none border-x-0`}>
      <div>
        <h4 className="font-bold text-sm">{title}</h4>
        {message && <div className="text-xs opacity-90">{message}</div>}
      </div>
      {dismissible && (
        <button className="btn btn-ghost btn-xs btn-circle ml-auto" aria-label="Dismiss alert">✕</button>
      )}
    </div>
  )
}
