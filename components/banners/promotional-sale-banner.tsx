import React, { useState } from 'react'

export interface PromotionalSaleBannerProps {
  discountCode?: string
  discountPercent?: number
  deadline?: string
}

export const PromotionalSaleBanner: React.FC<PromotionalSaleBannerProps> = ({
  discountCode = 'CYBER50',
  discountPercent = 50,
  deadline = 'Ends in 48 hours'
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(discountCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <aside aria-label="Promotional offer" className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-800 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="bg-white/20 text-white px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Flash Sale</span>
          <p className="text-sm font-medium">
            Get <strong className="text-yellow-300 font-extrabold">{discountPercent}% OFF</strong> your first annual subscription!
            <span className="opacity-80 text-xs ml-2 font-normal">({deadline})</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <code className="bg-black/30 border border-white/20 px-2.5 py-1 rounded text-xs font-mono font-bold tracking-widest text-yellow-300">
            {discountCode}
          </code>
          <button onClick={handleCopy} className="btn btn-xs bg-white text-gray-900 hover:bg-gray-100 font-semibold border-0">
            {copied ? '✓ Copied' : 'Copy Code'}
          </button>
        </div>
      </div>
    </aside>
  )
}
