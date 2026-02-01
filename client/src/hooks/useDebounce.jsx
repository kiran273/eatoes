import { useState, useEffect } from 'react'

/**
 * useDebounce — delays a value update until the user stops changing it.
 * @param {*}      value  – the raw value (e.g. search input)
 * @param {number} delay  – milliseconds to wait (default 300 per spec)
 * @returns {*} the debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // If value changes again before the timer fires, clear it
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
