import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CATEGORIES = ['Appetizer', 'Main Course', 'Dessert', 'Beverage']

const blankForm = {
  name: '',
  description: '',
  category: '',
  price: '',
  ingredients: '',
  isAvailable: true,
  preparationTime: '',
  imageUrl: ''
}

export default function MenuItemModal({ isOpen, onClose, onSubmit, editItem }) {
  const [form,    setForm]    = useState(blankForm)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  /* pre-fill when editing; reset when creating */
  useEffect(() => {
    if (editItem) {
      setForm({
        name:            editItem.name            || '',
        description:     editItem.description    || '',
        category:        editItem.category        || '',
        price:           editItem.price != null   ? String(editItem.price) : '',
        ingredients:     Array.isArray(editItem.ingredients) ? editItem.ingredients.join(', ') : '',
        isAvailable:     editItem.isAvailable     ?? true,
        preparationTime: editItem.preparationTime != null ? String(editItem.preparationTime) : '',
        imageUrl:        editItem.imageUrl        || ''
      })
    } else {
      setForm(blankForm)
    }
    setErrors({})
  }, [editItem, isOpen])

  if (!isOpen) return null

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.name.trim())                          errs.name     = 'Name is required'
    if (!form.category)                             errs.category = 'Category is required'
    if (!form.price || isNaN(form.price) || +form.price < 0) errs.price = 'A valid price is required'
    return errs
  }

  const handleSubmit = async () => {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) { setErrors(validationErrors); return }

    setLoading(true)
    setErrors({})

    const payload = {
      name:            form.name.trim(),
      description:     form.description.trim(),
      category:        form.category,
      price:           parseFloat(form.price),
      ingredients:     form.ingredients ? form.ingredients.split(',').map(s => s.trim()).filter(Boolean) : [],
      isAvailable:     form.isAvailable,
      preparationTime: form.preparationTime ? parseInt(form.preparationTime, 10) : 0,
      imageUrl:        form.imageUrl.trim()
    }

    try {
      await onSubmit(payload)   // parent fires the API call and updates context
      onClose()
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to save item' })
    } finally {
      setLoading(false)
    }
  }

  /* ── render ── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-40" onClick={onClose} />

      {/* panel */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">

        {/* header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {editItem ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* form body */}
        <div className="px-5 pb-5 space-y-4">

          {/* name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange}
              placeholder="e.g. Grilled Salmon"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
          </div>

          {/* category + price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category" value={form.category} onChange={handleChange}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white ${errors.category ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number" name="price" value={form.price} onChange={handleChange}
                placeholder="0.00" min="0" step="0.01"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.price ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>
          </div>

          {/* description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              placeholder="Describe the dish..." rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* ingredients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredients <span className="text-gray-400 font-normal">(comma-separated)</span>
            </label>
            <input
              type="text" name="ingredients" value={form.ingredients} onChange={handleChange}
              placeholder="e.g. salmon, lemon, butter, dill"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* prep time + image url */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
              <input
                type="number" name="preparationTime" value={form.preparationTime} onChange={handleChange}
                placeholder="15" min="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text" name="imageUrl" value={form.imageUrl} onChange={handleChange}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* availability toggle */}
          <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Available</span>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, isAvailable: !prev.isAvailable }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isAvailable ? 'bg-green-500' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isAvailable ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* submit-level error */}
          {errors.submit && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSubmit} disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : editItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
