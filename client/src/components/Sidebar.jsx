import React from 'react'
import { LayoutDashboard, UtensilsCrossed, ClipboardList, TrendingUp, ChefHat } from 'lucide-react'

const navItems = [
  { id: 'dashboard', label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'menu',      label: 'Menu Management',  icon: UtensilsCrossed },
  { id: 'orders',    label: 'Orders',           icon: ClipboardList   },
  { id: 'analytics', label: 'Analytics',        icon: TrendingUp      }
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Eatoes</h1>
            <p className="text-xs text-gray-500">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${active ? 'text-orange-600' : 'text-gray-400'}`} />
              {label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-600">RA</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Restaurant Admin</p>
            <p className="text-xs text-gray-500">v1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
