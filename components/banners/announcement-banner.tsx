import React, { useState } from 'react'

export interface AnnouncementBannerProps {
  badge?: string
  message?: string
  linkText?: string
  href?: string
  onDismiss?: () => void
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  badge = 'New Feature',
  message = 'Untitled UI 8.0 is now live with 1,500+ React Aria components.',
  linkText = 'Learn more →',
  href = '#',
  onDismiss
}) => {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className="relative isolate flex items-center justify-between gap-x-6 overflow-hidden bg-primary px-6 py-2.5 sm:px-3.5 text-primary-content">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm leading-6 mx-auto">
        <span className="badge badge-sm badge-secondary font-semibold">{badge}</span>
        <span>{message}</span>
        <a href={href} className="font-semibold underline underline-offset-4 hover:opacity-80">
          {linkText}
        </a>
      </div>
      <button
        onClick={() => { setVisible(false); onDismiss?.() }}
        className="btn btn-ghost btn-xs btn-circle text-primary-content"
        aria-label="Dismiss banner"
      >
        ✕
      </button>
    </div>
  )
}
