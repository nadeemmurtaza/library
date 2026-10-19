import React from 'react'

export interface DashboardProps {
  title?: string
  industry?: string
}

export const EcommerceOperationsDashboard: React.FC<DashboardProps> = ({
  title = 'E-Commerce Store & Orders Dashboard',
  industry = 'ecommerce'
}) => {
  return (
    <div className="p-6 bg-base-200 text-base-content min-h-screen">
      <header className="mb-6 flex justify-between items-center border-b border-base-300 pb-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm opacity-70">Industry: {industry}</p>
        </div>
      </header>
    </div>
  )
}

export default EcommerceOperationsDashboard
