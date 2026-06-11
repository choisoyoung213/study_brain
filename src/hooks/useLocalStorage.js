import { useState, useEffect, useCallback } from 'react'

export default function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch (e) {
      console.error(e)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
      console.error(e)
    }
  }, [key, state])

  // sync across tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === key) {
        try {
          setState(e.newValue ? JSON.parse(e.newValue) : initialValue)
        } catch (err) {
          console.error(err)
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key, initialValue])

  const set = useCallback(
    (val) => {
      setState((prev) => (typeof val === 'function' ? val(prev) : val))
    },
    [setState]
  )

  const clear = useCallback(() => setState(initialValue), [initialValue])

  return [state, set, clear]
}
