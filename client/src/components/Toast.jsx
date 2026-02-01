import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

/* ──── Toast banner ──── */
export function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [message, onClose, duration])

  if (!message) return null

  const isSuccess = type === 'success'

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border max-w-sm ${
          isSuccess
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50   border-red-200   text-red-800'
        }`}
      >
        {isSuccess
          ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          : <XCircle    className="w-5 h-5 text-red-500   shrink-0" />
        }
        <p className="text-sm font-medium flex-1">{message}</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

/* ──── useToast hook ──── */
export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'success' })

  const showToast = (message, type = 'success') => setToast({ message, type })
  const hideToast = () => setToast({ message: '', type: 'success' })

  const ToastComponent = (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  )

  return { showToast, ToastComponent }
}
