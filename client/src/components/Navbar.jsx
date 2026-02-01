import React from 'react'
import { Bell, Search } from 'lucide-react'

const pageMeta = {
  dashboard: { title: 'Dashboard',         sub: "Welcome back! Here's what's happening today." },
  menu:      { title: 'Menu Management',   sub: 'Manage your restaurant menu items.'           },
  orders:    { title: 'Orders',            sub: 'Track and manage incoming orders.'            },
  analytics: { title: 'Analytics',         sub: 'View your restaurant performance.'            }
}

export default function Navbar({ activePage }) {
  const { title, sub } = pageMeta[activePage] || pageMeta.dashboard

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick search (cosmetic — real search lives on the Menu page) */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quick search..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-48"
          />
        </div>

        {/* Bell */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
