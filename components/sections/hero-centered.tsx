import React from 'react'

export const HeroCentered: React.FC<{
  badge?: string
  headline?: string
  description?: string
  primaryAction?: string
  secondaryAction?: string
}> = ({
  badge = '⚡️ Designed for high-velocity teams',
  headline = 'Scale your software faster with Untitled UI',
  description = 'The ultimate library of accessible components, design tokens, charts, and application templates built for modern teams.',
  primaryAction = 'Start Building Today',
  secondaryAction = 'Book Live Demo'
}) => {
  return (
    <section className="py-20 lg:py-28 text-center px-4 max-w-5xl mx-auto">
      <div className="badge badge-outline badge-primary font-medium text-xs mb-6 px-3 py-1">
        {badge}
      </div>
      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-base-content leading-tight">
        {headline}
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-base-content/70 max-w-3xl mx-auto leading-relaxed">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button className="btn btn-primary btn-md sm:btn-lg font-semibold">{primaryAction}</button>
        <button className="btn btn-outline btn-md sm:btn-lg font-semibold">{secondaryAction}</button>
      </div>
    </section>
  )
}
