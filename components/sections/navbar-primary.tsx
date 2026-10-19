import React from 'react'

export const NavbarPrimary: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur border-b border-base-300 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="#" className="font-bold text-lg tracking-tight">Untitled UI</a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium opacity-80">
            <a href="#" className="hover:opacity-100">Components</a>
            <a href="#" className="hover:opacity-100">Dashboards</a>
            <a href="#" className="hover:opacity-100">BI Analytics</a>
            <a href="#" className="hover:opacity-100">Pricing</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="btn btn-sm btn-ghost">Sign in</a>
          <a href="#" className="btn btn-sm btn-primary">Get Started</a>
        </div>
      </div>
    </header>
  )
}
