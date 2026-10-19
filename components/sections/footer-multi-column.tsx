import React from 'react'

export const FooterMultiColumn: React.FC = () => {
  return (
    <footer className="border-t border-base-300 bg-base-100 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="font-extrabold text-xl tracking-tight">Untitled UI Library</div>
          <p className="text-xs opacity-60 mt-2 max-w-sm">
            High-performance reusable component library, design tokens, and production templates for modern engineering teams.
          </p>
        </div>
        <div>
          <div className="font-semibold text-xs uppercase tracking-wider opacity-60 mb-3">Product</div>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="#" className="hover:underline">Components</a></li>
            <li><a href="#" className="hover:underline">Dashboards</a></li>
            <li><a href="#" className="hover:underline">BI Charts</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-xs uppercase tracking-wider opacity-60 mb-3">Resources</div>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="#" className="hover:underline">Documentation</a></li>
            <li><a href="#" className="hover:underline">Design Tokens</a></li>
            <li><a href="#" className="hover:underline">Icons (1,173)</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-xs uppercase tracking-wider opacity-60 mb-3">Legal</div>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="#" className="hover:underline">Privacy Policy</a></li>
            <li><a href="#" className="hover:underline">Terms of Service</a></li>
            <li><a href="#" className="hover:underline">MIT License</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-base-200 mt-12 pt-6 flex justify-between text-xs opacity-50">
        <div>© 2026 Untitled UI Library. All rights reserved.</div>
        <div>Built with React, React Aria & Tailwind CSS</div>
      </div>
    </footer>
  )
}
