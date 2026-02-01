import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Loader2, Edit2, Trash2, Clock } from 'lucide-react'
import { useDebounce }  from '../hooks/useDebounce.jsx'
import { useMenu }      from '../context/MenuContext.jsx'
import { useToast }     from '../components/Toast.jsx'
import MenuItemModal    from '../components/MenuItemModal.jsx'
import api              from '../utils/api'

const CATEGORIES   = ['All', 'Appetizer', 'Main Course', 'Dessert', 'Beverage']
const AVAIL_FILTER = ['All', 'Available', 'Unavailable']

export default function MenuManagement() {
  const { menuItems, addMenuItem, updateMenuItem, removeMenuItem, toggleItemAvailability } = useMenu()
  const { showToast, ToastComponent } = useToast()

  /* ── filter state ── */
  const [searchInput,          setSearchInput]          = useState('')
  const [selectedCategory,     setSelectedCategory]     = useState('All')
  const [selectedAvailability, setSelectedAvailability] = useState('All')

  /* ── debounced search ── */
  const debouncedSearch = useDebounce(searchInput, 300)
  const [searchResults, setSearchResults] = useState(null) // null = use context list
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    const run = async () => {
      if (!debouncedSearch.trim()) { setSearchResults(null); return }
      setSearchLoading(true)
      try {
        const res = await api.get('/api/menu/search', { params: { q: debouncedSearch } })
        setSearchResults(res.data)
      } catch {
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }
    run()
  }, [debouncedSearch])

  /* ── derived filtered list ── */
  const base = searchResults !== null ? searchResults : menuItems
  const filtered = base.filter(item => {
    if (selectedCategory !== 'All'     && item.category !== selectedCategory)  return false
    if (selectedAvailability === 'Available'   && !item.isAvailable)           return false
    if (selectedAvailability === 'Unavailable' &&  item.isAvailable)           return false
    return true
  })

  /* ── modal state ── */
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem,  setEditItem]  = useState(null)

  /* ── CRUD ── */
  const handleCreate = async (payload) => {
    const res = await api.post('/api/menu', payload)
    addMenuItem(res.data)
    showToast('Menu item created successfully', 'success')
  }

  const handleUpdate = async (payload) => {
    const res = await api.put(`/api/menu/${editItem._id}`, payload)
    updateMenuItem(editItem._id, res.data)
    showToast('Menu item updated successfully', 'success')
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await api.delete(`/api/menu/${id}`)
      removeMenuItem(id)
      showToast(`"${name}" deleted successfully`, 'success')
    } catch (err) {
      showToast(err.message || 'Failed to delete item', 'error')
    }
  }

  /* ── optimistic toggle ── */
  const handleToggle = useCallback(async (id, currentStatus) => {
    toggleItemAvailability(id)                          // 1. flip locally
    try {
      await api.patch(`/api/menu/${id}/availability`)  // 2. fire request
      showToast(`Item is now ${currentStatus ? 'unavailable' : 'available'}`, 'success')
    } catch {
      toggleItemAvailability(id)                        // 3. rollback
      showToast('Failed to update availability. Change reverted.', 'error')
    }
  }, [toggleItemAvailability, showToast])

  /* ── render ── */
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {ToastComponent}

      {/* ── controls bar ── */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white space-y-3">
        {/* search + add */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchLoading && <Loader2 className="w-4 h-4 text-orange-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />}
            <input
              type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by name or ingredients…"
              className="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => { setEditItem(null); setModalOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        {/* filter pills */}
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Category:</span>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedCategory === cat ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >{cat}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            {AVAIL_FILTER.map(av => (
              <button key={av} onClick={() => setSelectedAvailability(av)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedAvailability === av ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >{av}</button>
            ))}
          </div>
        </div>
      </div>

      {/* count line */}
      <div className="px-6 pt-3 pb-1">
        <p className="text-xs text-gray-500">
          Showing <span className="font-semibold text-gray-700">{filtered.length}</span> item{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* ── grid ── */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">No items found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <MenuCard
                key={item._id}  item={item}
                onEdit   ={() => { setEditItem(item); setModalOpen(true) }}
                onDelete ={() => handleDelete(item._id, item.name)}
                onToggle ={() => handleToggle(item._id, item.isAvailable)}
              />
            ))}
          </div>
        )}
      </div>

      {/* modal */}
      <MenuItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editItem={editItem}
        onSubmit={editItem ? handleUpdate : handleCreate}
      />
    </div>
  )
}

/* ──────────────────────── MenuCard ──────────────────────── */
const CAT_COLORS = {
  Appetizer:     'bg-yellow-100 text-yellow-700',
  'Main Course': 'bg-blue-100   text-blue-700',
  Dessert:       'bg-pink-100   text-pink-700',
  Beverage:      'bg-green-100  text-green-700'
}

function MenuCard({ item, onEdit, onDelete, onToggle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
      {/* image / placeholder */}
      <div className="h-40 bg-gray-100 relative overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none' }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-4xl">🍽️</span></div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CAT_COLORS[item.category]}`}>
            {item.category}
          </span>
        </div>
      </div>

      {/* content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{item.name}</h3>
          <span className="text-sm font-bold text-orange-600">${item.price.toFixed(2)}</span>
        </div>
        {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
        {item.preparationTime > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">{item.preparationTime} min</span>
          </div>
        )}

        {/* actions row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          {/* toggle */}
          <button onClick={onToggle} className="flex items-center gap-2" title={item.isAvailable ? 'Mark unavailable' : 'Mark available'}>
            <div className={`relative w-9 h-5 rounded-full transition-colors ${item.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.isAvailable ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
            <span className={`text-xs font-medium ${item.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </button>

          {/* edit / delete */}
          <div className="flex gap-1">
            <button onClick={onEdit}   className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit"><Edit2  className="w-4 h-4" /></button>
            <button onClick={onDelete} className="p-1.5 rounded-md text-gray-400 hover:text-red-600  hover:bg-red-50  transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
