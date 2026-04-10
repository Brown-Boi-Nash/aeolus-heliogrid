import { useState, useCallback } from 'react'

const STORAGE_KEY = 'aeolusHelioGrid_savedScenarios'
const MAX_SAVED   = 8

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') } catch { return [] }
}

function persist(scenarios) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios)) } catch {}
}

/**
 * Manages a list of saved calculator snapshots in localStorage.
 * Each snapshot is a plain object — callers decide what to include.
 */
export function useSavedScenarios() {
  const [scenarios, setScenarios] = useState(load)

  const saveScenario = useCallback((snapshot) => {
    setScenarios((prev) => {
      const next = [snapshot, ...prev].slice(0, MAX_SAVED)
      persist(next)
      return next
    })
  }, [])

  const deleteScenario = useCallback((id) => {
    setScenarios((prev) => {
      const next = prev.filter((s) => s.id !== id)
      persist(next)
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setScenarios([])
    persist([])
  }, [])

  return { scenarios, saveScenario, deleteScenario, clearAll }
}
