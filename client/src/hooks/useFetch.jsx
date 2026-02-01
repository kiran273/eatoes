import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

/**
 * useFetch — generic hook for GET requests.
 * @param {string} url        – endpoint path
 * @param {object} options    – { params, enabled }
 * @returns {{ data, loading, error, refetch }}
 */
export function useFetch(url, options = {}) {
  const { params = {}, enabled = true } = options

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError]     = useState(null)

  // Serialise params once so the effect dep is stable
  const serialisedParams = JSON.stringify(params)

  const fetchData = useCallback(async () => {
    if (!url || !enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await api.get(url, { params: JSON.parse(serialisedParams) })
      setData(result.data !== undefined ? result.data : result)
    } catch (err) {
      setError(err.message || 'Failed to fetch data')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [url, enabled, serialisedParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
