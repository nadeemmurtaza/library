import React from 'react'

export const FaqAccordion: React.FC = () => {
  const faqs = [
    { q: 'Can I use Untitled UI components in commercial projects?', a: 'Yes! The library components and icons are licensed under MIT, giving you complete freedom for commercial and personal apps.' },
    { q: 'How do design tokens work with Tailwind CSS v4?', a: 'All color ramps, radii, and typography scales are defined using CSS custom properties and the new @theme inline block.' },
    { q: 'Is there full TypeScript support?', a: 'Every component, module schema, and hook is written in strict TypeScript with complete prop definitions.' }
  ]

  return (
    <section className="py-20 max-w-4xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="collapse collapse-arrow bg-base-100 border border-base-300">
            <input type="radio" name="faq-accordion" defaultChecked={i === 0} />
            <div className="collapse-title text-base font-semibold">{f.q}</div>
            <div className="collapse-content text-sm opacity-70 leading-relaxed">{f.a}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
