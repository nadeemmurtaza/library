import React from 'react'
import { KpiMetricCard } from '@/components/bi/kpi-metric-card'
import { BiLineChart } from '@/components/bi/bi-line-chart'
import { BiDonutChart } from '@/components/bi/bi-donut-chart'
import { BiCohortHeatmap } from '@/components/bi/bi-cohort-heatmap'
import { BiFilterBar } from '@/components/bi/bi-filter-bar'

export const DashboardAnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Executive BI Dashboard</h1>
          <p className="text-sm opacity-70">Cross-channel revenue, customer cohorts, and platform health.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-sm btn-outline">Schedule Report</button>
          <button className="btn btn-sm btn-primary">Download Board Deck</button>
        </div>
      </header>

      <BiFilterBar />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiMetricCard title="Net ARR" value="$1,248,500" deltaPercent={14.8} deltaPeriod="vs prior quarter" />
        <KpiMetricCard title="Gross Margin" value="84.2%" deltaPercent={2.1} deltaPeriod="vs budget" />
        <KpiMetricCard title="Paid Customers" value="3,842" deltaPercent={9.4} deltaPeriod="vs last month" />
        <KpiMetricCard title="Churn Rate" value="0.82%" deltaPercent={-18.4} deltaPeriod="improvement" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BiLineChart />
        </div>
        <div>
          <BiDonutChart />
        </div>
      </div>

      <BiCohortHeatmap />
    </div>
  )
}

export default DashboardAnalyticsPage
