import React, { useState, useEffect } from 'react'

export const CookieConsentBanner: React.FC<{ onAccept?: () => void; onDecline?: () => void }> = ({
  onAccept,
  onDecline
}) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!localStorage.getItem('cookie-consent')) setVisible(true)
  }, [])

  if (!visible) return null

  const handle = (accepted: boolean) => {
    localStorage.setItem('cookie-consent', accepted ? 'true' : 'false')
    setVisible(false)
    if (accepted) onAccept?.(); else onDecline?.()
  }

  return (
    <aside aria-label="Cookie consent" className="fixed bottom-0 inset-x-0 z-50 p-4 bg-base-100/95 backdrop-blur border-t border-base-300 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
        <p className="opacity-80 leading-relaxed text-xs sm:text-sm">
          We use cookies to analyze web traffic, optimize your browsing experience, and measure feature usage. By clicking &quot;Accept All&quot;, you consent to our use of cookies according to our Privacy Policy.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => handle(false)} className="btn btn-xs sm:btn-sm btn-outline">Decline Optional</button>
          <button onClick={() => handle(true)} className="btn btn-xs sm:btn-sm btn-primary">Accept All</button>
        </div>
      </div>
    </aside>
  )
}
