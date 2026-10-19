import React from 'react'

export interface NotificationItem {
  id: string
  title: string
  time: string
  read: boolean
}

export const NotificationFeed: React.FC<{ items: NotificationItem[] }> = ({ items }) => {
  return (
    <div className="divide-y divide-base-200">
      {items.map((i) => (
        <div key={i.id} className={`p-3 hover:bg-base-200 transition ${i.read ? 'opacity-60' : 'font-semibold'}`}>
          <div className="text-sm">{i.title}</div>
          <div className="text-xs opacity-50">{i.time}</div>
        </div>
      ))}
    </div>
  )
}
