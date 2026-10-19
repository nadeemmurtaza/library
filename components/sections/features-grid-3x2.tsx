import React from 'react'

export interface FeatureItem {
  icon: string
  title: string
  description: string
}

export const FeaturesGrid3x2: React.FC<{ features?: FeatureItem[] }> = ({
  features = [
    { icon: '⚡️', title: 'Lightning Performance', description: 'Zero-runtime styles and Tailwind v4 compilation for instant page loads.' },
    { icon: '🛡️', title: 'Enterprise Security', description: 'Built-in role-based access control, session validation, and hardened schemas.' },
    { icon: '📊', title: 'Built-in BI & Charts', description: 'Comprehensive metric cards, sparklines, gauges, cohort analysis, and data grids.' },
    { icon: '🎨', title: 'Full Token Theming', description: 'Switch between light, dark, and custom brand palettes with CSS custom properties.' },
    { icon: '♿️', title: 'Accessible by Default', description: 'WCAG AAA compliance powered by React Aria primitives and keyboard navigation.' },
    { icon: '🧩', title: 'Modular Architecture', description: 'Drop-in components, layouts, and standalone full-page templates ready to ship.' }
  ]
}) => {
  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold">Engineered for perfection</h2>
        <p className="mt-3 opacity-70">Everything you need to deliver production web applications without reinvention.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="card bg-base-100 p-6 border border-base-300 hover:border-primary/50 transition">
            <div className="text-3xl mb-4">{f.icon}</div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-sm opacity-70 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
