import useSWR from 'swr'
import { useEffect } from 'react'
import {
  fetchNationalElectricityPrice,
  fetchSolarCapacityTrend,
  fetchStatePrices,
} from '../lib/eiaClient'
import {
  extractNationalPrice,
  normalizeEiaPriceSeries,
  normalizeCapacitySeries,
  extractTotalCapacity,
  normalizeStatePrices,
} from '../lib/dataNormalizer'
import useDashboardStore from '../store/dashboardStore'

async function fetchAllEiaData() {
  const [priceRows, capacityRows, statePriceRows] = await Promise.all([
    fetchNationalElectricityPrice(),
    fetchSolarCapacityTrend(),
    fetchStatePrices(),
  ])

  return {
    nationalElectricityPrice: extractNationalPrice(priceRows),
    priceTimeSeries: normalizeEiaPriceSeries(priceRows),
    totalSolarCapacityGW: extractTotalCapacity(capacityRows),
    capacityTimeSeries: normalizeCapacitySeries(capacityRows),
    statePrices: normalizeStatePrices(statePriceRows),
  }
}

export function useEiaData() {
  const setMarketData = useDashboardStore((s) => s.setMarketData)
  const initializeCalculatorFromMarket = useDashboardStore((s) => s.initializeCalculatorFromMarket)

  const { data, error, isLoading } = useSWR('eia-all', fetchAllEiaData, {
    revalidateOnFocus: false,
    dedupingInterval: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (data) {
      setMarketData(data)
      initializeCalculatorFromMarket()
    }
  }, [data, setMarketData, initializeCalculatorFromMarket])

  return { data, error, isLoading }
}
