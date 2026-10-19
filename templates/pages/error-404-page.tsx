import React from 'react'

export const Error404Page: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center justify-center p-6 text-center">
      <span className="badge badge-error badge-lg font-mono font-bold mb-4">404 ERROR</span>
      <h1 className="text-4xl sm:text-6xl font-black mb-3">Page not found</h1>
      <p className="text-base opacity-70 max-w-md mb-8">
        Sorry, the page you are searching for does not exist or has been relocated.
      </p>
      <a href="/" className="btn btn-primary font-bold">Return to Dashboard</a>
    </div>
  )
}
