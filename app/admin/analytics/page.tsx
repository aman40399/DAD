'use client'

import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'

export default function AdminAnalyticsPage() {
  return (
    <div
      className="h-full flex-1 min-h-0 overflow-y-auto overscroll-y-contain space-y-6 pb-20 apple-scrollbar"
      style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
    >
      <AnalyticsDashboard />
    </div>
  )
}
