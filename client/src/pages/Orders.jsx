import React, { useState, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useToast } from '../components/Toast.jsx'
import api          from '../utils/api'

const STATUS_OPTIONS = ['All', 'Pending', 'Preparing', 'Ready', 'Delivered', 'Cancelled']

const STATUS_COLORS = {
  Pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Preparing: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  Ready:     { bg: 'bg-green-100',  text: 'text-green-700'  },
  Delivered: { bg: 'bg-gray-100',   text: 'text-gray-600'   },
  Cancelled: { bg: 'bg-red-100',    text: 'text-red-600'    }
}

/* state-machine: which statuses can each status transition TO */
const VALID_TRANSITIONS = {
  Pending:   ['Preparing', 'Cancelled'],
  Preparing: ['Ready',     'Cancelled'],
  Ready:     ['Delivered'],
  Delivered: [],
  Cancelled: []
}

const LIMIT = 10

export default function Orders() {
  const { showToast, ToastComponent } = useToast()

  const [orders,         setOrders]         = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [expandedId,     setExpandedId]     = useState(null)
  const [page,           setPage]           = useState(1)
  const [totalPages,     setTotalPages]     = useState(1)
  const [total,          setTotal]          = useState(0)

  /* ── fetch ── */
  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = { page, limit: LIMIT }
      if (selectedStatus !== 'All') params.status = selectedStatus
      const res = await api.get('/api/orders', { params })
      setOrders(res.data)
      setTotalPages(res.pagination.totalPages)
      setTotal(res.pagination.total)
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }, [page, selectedStatus])

  useEffect(() => { fetchOrders() }, [fetchOrders])
  useEffect(() => { setPage(1) }, [selectedStatus]) // reset page on filter change

  /* ── status update ── */
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/api/orders/${orderId}/status`, { status: newStatus })
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: res.data.status } : o))
      showToast(`Order status updated to "${newStatus}"`, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error')
    }
  }

  /* ── loading placeholder ── */
  if (loading && orders.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
          <p className="text-gray-500 mt-3 text-sm">Loading orders…</p>
        </div>
      </div>
    )
  }

  /* ── render ── */
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {ToastComponent}

      {/* filter bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-500">Filter by Status:</span>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedStatus === s ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >{s}</button>
          ))}
          <span className="ml-auto text-xs text-gray-400">{total} order{total !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* order list */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {orders.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <p className="text-sm font-medium text-gray-600">No orders found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filter</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(order => (
              <OrderRow
                key={order._id}
                order={order}
                isExpanded={expandedId === order._id}
                onToggle   ={() => setExpandedId(prev => prev === order._id ? null : order._id)}
                onStatusChange={(ns) => handleStatusChange(order._id, ns)}
              />
            ))}
          </div>
        )}

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
              Previous
            </button>

            {/* page numbers with ellipsis */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…')
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) =>
                p === '…'
                  ? <span key={`d${idx}`} className="text-xs text-gray-400">…</span>
                  : <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${page === p ? 'bg-orange-500 text-white' : 'border border-gray-300 hover:bg-gray-100'}`}
                    >{p}</button>
              )
            }

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ──────────────────────── OrderRow ──────────────────────── */
function OrderRow({ order, isExpanded, onToggle, onStatusChange }) {
  const col         = STATUS_COLORS[order.status] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  const transitions = VALID_TRANSITIONS[order.status] || []

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* main row */}
      <div className="flex items-center px-4 py-3 gap-4">
        <button onClick={onToggle} className="text-gray-400 hover:text-gray-600 transition-colors">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{order.orderNumber}</span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.bg} ${col.text}`}>{order.status}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {order.customerName} · Table {order.tableNumber} ·{' '}
            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <span className="text-sm font-bold text-gray-800">${order.totalAmount.toFixed(2)}</span>

        {/* status dropdown */}
        {transitions.length > 0 ? (
          <select value="" onChange={e => { if (e.target.value) onStatusChange(e.target.value) }}
            className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium border border-gray-300 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-gray-400"
          >
            <option value="" disabled>Update →</option>
            {transitions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <span className="text-xs text-gray-400 italic">Final</span>
        )}
      </div>

      {/* expanded detail */}
      {isExpanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2">Items Ordered:</p>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5">×{item.quantity}</span>
                  <span className="text-sm text-gray-800">{item.menuItem?.name || 'Unknown Item'}</span>
                  {item.menuItem?.category && <span className="text-xs text-gray-400">({item.menuItem.category})</span>}
                </div>
                <span className="text-sm text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-2 pt-2 border-t border-gray-200">
            <span className="text-sm font-semibold text-gray-900">Total: ${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
