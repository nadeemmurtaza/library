import React from 'react'

export const HeroSplit: React.FC = () => {
  return (
    <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <span className="badge badge-sm badge-primary font-bold mb-4">Enterprise Grade</span>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
          Supercharge your analytics with real-time intelligence
        </h1>
        <p className="mt-4 text-lg opacity-75">
          Connect your warehouse, compute retention cohorts in seconds, and surface actionable insights with interactive BI components.
        </p>
        <div className="mt-8 flex gap-4">
          <button className="btn btn-primary">Start 14-day Trial</button>
          <button className="btn btn-ghost">View Interactive Sandbox →</button>
        </div>
      </div>
      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xl">
        <div className="h-64 rounded-lg bg-gradient-to-tr from-primary/10 via-base-200 to-secondary/10 flex items-center justify-center text-sm font-semibold opacity-60">
          [Interactive Dashboard Preview Mockup]
        </div>
      </div>
    </section>
  )
}
