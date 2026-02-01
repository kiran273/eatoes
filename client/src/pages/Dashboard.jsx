import React, { useEffect, useState } from 'react'
import { ShoppingBag, DollarSign, Clock, UtensilsCrossed, TrendingUp, Users, Loader2 } from 'lucide-react'
import api from '../utils/api'
import { useMenu } from '../context/MenuContext.jsx'

/* ── stat card ── */
function StatCard({ title, value, subtitle, icon: Icon, color, bgColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { menuItems } = useMenu()

  const [summary,      setSummary]      = useState(null)
  const [topSellers,   setTopSellers]   = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, topRes, ordRes] = await Promise.all([
          api.get('/api/analytics/summary'),
          api.get('/api/analytics/top-sellers'),
          api.get('/api/orders', { params: { limit: 5 } })
        ])
        setSummary(sumRes.data)
        setTopSellers(topRes.data)
        setRecentOrders(ordRes.data)
      } catch (err) {
        console.error('Dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pendingCount   = summary?.byStatus?.find(s => s.status === 'Pending')?.count   || 0
  const preparingCount = summary?.byStatus?.find(s => s.status === 'Preparing')?.count || 0
  const availableItems = menuItems.filter(i => i.isAvailable).length

  const statusColors = {
    Pending:    'bg-yellow-100 text-yellow-700',
    Preparing:  'bg-blue-100   text-blue-700',
    Ready:      'bg-green-100  text-green-700',
    Delivered:  'bg-gray-100   text-gray-600',
    Cancelled:  'bg-red-100    text-red-600'
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
          <p className="text-gray-500 mt-3 text-sm">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">

      {/* ── stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Orders"   value={summary?.totalOrders || 0}                                  subtitle="All time"                                              icon={ShoppingBag}      color="text-orange-600" bgColor="bg-orange-50"  />
        <StatCard title="Total Revenue"  value={`$${(summary?.totalRevenue || 0).toFixed(2)}`}             subtitle="All time"                                              icon={DollarSign}       color="text-green-600"  bgColor="bg-green-50"   />
        <StatCard title="Active Orders"  value={pendingCount + preparingCount}                              subtitle={`${pendingCount} pending, ${preparingCount} preparing`} icon={Clock}            color="text-blue-600"   bgColor="bg-blue-50"    />
        <StatCard title="Menu Items"     value={menuItems.length}                                           subtitle={`${availableItems} available`}                         icon={UtensilsCrossed}  color="text-purple-600" bgColor="bg-purple-50"  />
      </div>

      {/* ── bottom two columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* top sellers */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" /> Top Sellers
            </h3>
            <span className="text-xs text-gray-400">Top 5</span>
          </div>
          <div className="p-4 space-y-3">
            {topSellers.length === 0
              ? <p className="text-sm text-gray-400 text-center py-6">No sales data yet</p>
              : topSellers.map((item, idx) => (
                  <div key={item.menuItemId} className="flex items-center gap-3">
                    <span className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category} · {item.totalQuantity} sold</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">${item.totalRevenue.toFixed(2)}</span>
                  </div>
                ))
            }
          </div>
        </div>

        {/* recent orders */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" /> Recent Orders
            </h3>
            <span className="text-xs text-gray-400">Latest 5</span>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0
              ? <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
              : recentOrders.map(order => (
                  <div key={order._id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400">{order.customerName} · Table {order.tableNumber}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-700">${order.totalAmount.toFixed(2)}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
            }
          </div>
        </div>

      </div>
    </div>
  )
}
