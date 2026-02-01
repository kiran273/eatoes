import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, ShoppingBag, Loader2 } from 'lucide-react'
import api from '../utils/api'

const STATUS_STYLES = {
  Pending:   { bar: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' },
  Preparing: { bar: 'bg-blue-500',   light: 'bg-blue-100',   text: 'text-blue-700'   },
  Ready:     { bar: 'bg-green-500',  light: 'bg-green-100',  text: 'text-green-700'  },
  Delivered: { bar: 'bg-gray-500',   light: 'bg-gray-100',   text: 'text-gray-700'   },
  Cancelled: { bar: 'bg-red-500',    light: 'bg-red-100',    text: 'text-red-700'    }
}

export default function Analytics() {
  const [topSellers, setTopSellers] = useState([])
  const [summary,    setSummary]    = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [topRes, sumRes] = await Promise.all([
          api.get('/api/analytics/top-sellers'),
          api.get('/api/analytics/summary')
        ])
        setTopSellers(topRes.data)
        setSummary(sumRes.data)
      } catch (err) {
        console.error('Analytics fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
          <p className="text-gray-500 mt-3 text-sm">Loading analytics…</p>
        </div>
      </div>
    )
  }

  const maxQty = topSellers.length ? Math.max(...topSellers.map(s => s.totalQuantity)) : 1

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* ── summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{summary?.totalOrders || 0}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${(summary?.totalRevenue || 0).toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${summary?.totalOrders ? (summary.totalRevenue / summary.totalOrders).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ── two-column: bar chart + status breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* top sellers bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" /> Top 5 Selling Items
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Ranked by total quantity sold</p>
          </div>

          <div className="p-5 space-y-4">
            {topSellers.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-gray-400">No sales data available yet</p>
                <p className="text-xs text-gray-300 mt-1">Place some orders to see analytics</p>
              </div>
            ) : (
              topSellers.map((item, idx) => {
                const pct = (item.totalQuantity / maxQty) * 100
                return (
                  <div key={item.menuItemId}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                        <span className="text-xs text-gray-400">({item.category})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{item.totalQuantity} sold</span>
                        <span className="text-sm font-semibold text-green-600">${item.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${idx === 0 ? 'bg-orange-500' : 'bg-orange-300'}`} style={{ width: `${pct}%`, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* status breakdown */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Orders by Status</h3>
          </div>
          <div className="p-5 space-y-3">
            {!summary?.byStatus?.length ? (
              <p className="text-sm text-gray-400 text-center py-6">No data</p>
            ) : (
              summary.byStatus.map(item => {
                const s   = STATUS_STYLES[item.status] || { bar: 'bg-gray-500', light: 'bg-gray-100', text: 'text-gray-700' }
                const pct = summary.totalOrders ? ((item.count / summary.totalOrders) * 100).toFixed(0) : 0
                return (
                  <div key={item.status} className={`p-3 rounded-lg ${s.light}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-semibold ${s.text}`}>{item.status}</span>
                      <span className="text-xs text-gray-500">{item.count} ({pct}%)</span>
                    </div>
                    <div className="mt-1.5 w-full h-1.5 bg-white rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Revenue: ${item.revenue.toFixed(2)}</p>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
