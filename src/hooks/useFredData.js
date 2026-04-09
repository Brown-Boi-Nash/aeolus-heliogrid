import useSWR from 'swr'
import { useEffect } from 'react'
import { fetchFredMacro } from '../lib/fredClient'
import useDashboardStore from '../store/dashboardStore'

export function useFredData() {
  const setFredData = useDashboardStore((s) => s.setFredData)

  const { data, error, isLoading } = useSWR('fred-macro', fetchFredMacro, {
    revalidateOnFocus: false,
    dedupingInterval: 60 * 60 * 1000, // 1 hour — macro rates don't change that fast
  })

  useEffect(() => {
    if (data) setFredData(data)
  }, [data, setFredData])

  return { data, error, isLoading }
}
