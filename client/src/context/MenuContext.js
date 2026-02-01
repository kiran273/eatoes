import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const MenuContext = createContext(null)

export function MenuProvider({ children }) {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  // ── fetch ──────────────────────────────────────────
  const fetchMenuItems = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/api/menu', { params: filters })
      setMenuItems(response.data)
    } catch (err) {
      setError(err.message || 'Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  // ── local mutators (keep UI in sync without re-fetching) ──
  const addMenuItem = (item) => {
    setMenuItems(prev => [item, ...prev])
  }

  const updateMenuItem = (id, updatedItem) => {
    setMenuItems(prev =>
      prev.map(item => (item._id === id ? { ...item, ...updatedItem } : item))
    )
  }

  const removeMenuItem = (id) => {
    setMenuItems(prev => prev.filter(item => item._id !== id))
  }

  const toggleItemAvailability = (id) => {
    setMenuItems(prev =>
      prev.map(item =>
        item._id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    )
  }

  return (
    <MenuContext.Provider
      value={{
        menuItems,
        loading,
        error,
        fetchMenuItems,
        addMenuItem,
        updateMenuItem,
        removeMenuItem,
        toggleItemAvailability
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error('useMenu must be used within a <MenuProvider>')
  }
  return context
}
