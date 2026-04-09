import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { FINANCIAL_DEFAULTS } from '../constants/financialDefaults'
import { WIND_FINANCIAL_DEFAULTS } from '../constants/windDefaults'

const useDashboardStore = create(
  subscribeWithSelector((set, get) => ({
    // ─── Global Mode ────────────────────────────────────────────────
    energyType: 'solar', // 'solar' | 'wind'

    setEnergyType: (energyType) => set((state) => {
      if (!['solar', 'wind'].includes(energyType) || state.energyType === energyType) {
        return {}
      }
      const sourceDefaults = energyType === 'wind' ? WIND_FINANCIAL_DEFAULTS : FINANCIAL_DEFAULTS
      return {
        energyType,
        selectedState: null,
        selectedStateFips: null,
        selectedStateAbbr: null,
        calculatorInputs: {
          ...state.calculatorInputs,
          capacityFactor: sourceDefaults.capacityFactor,
          degradationRate: sourceDefaults.degradationRate,
          installCostPerW: sourceDefaults.installCostPerW,
          omCostPerKWPerYear: sourceDefaults.omCostPerKWPerYear,
          itcPercent: sourceDefaults.itcPercent,
        },
      }
    }),

    // ─── Market Slice ────────────────────────────────────────────────
    nationalElectricityPrice: null,
    totalSolarCapacityGW: null,
    totalWindCapacityGW: null,
    priceTimeSeries: [],
    statePrices: {},
    marketLastFetched: null,
    marketInitialized: false,

    setMarketData: (data) => set({
      nationalElectricityPrice: data.nationalElectricityPrice,
      totalSolarCapacityGW: data.totalSolarCapacityGW,
      totalWindCapacityGW: data.totalWindCapacityGW,
      priceTimeSeries: data.priceTimeSeries ?? [],
      statePrices: data.statePrices ?? {},
      marketLastFetched: new Date().toISOString(),
    }),

    // Cross-tab flow #1: called once when EIA price first loads
    initializeCalculatorFromMarket: () => {
      const { nationalElectricityPrice, marketInitialized } = get()
      if (marketInitialized || !nationalElectricityPrice) return
      set((state) => ({
        marketInitialized: true,
        calculatorInputs: {
          ...state.calculatorInputs,
          electricityRate: nationalElectricityPrice,
        },
      }))
    },

    // ─── Calculator Slice ────────────────────────────────────────────
    calculatorInputs: { ...FINANCIAL_DEFAULTS },
    selectedStateFips: null,
    selectedStateAbbr: null,

    setCalculatorInput: (key, value) => set((state) => ({
      calculatorInputs: { ...state.calculatorInputs, [key]: value },
    })),

    setScenario: (scenario) => set((state) => ({
      calculatorInputs: { ...state.calculatorInputs, scenario },
    })),

    // Cross-tab flow #2: called on map state click
    applyStateToCalculator: ({ capacityFactor, electricityRate, fips, abbr }) => set((state) => ({
      selectedStateFips: fips,
      selectedStateAbbr: abbr,
      calculatorInputs: {
        ...state.calculatorInputs,
        capacityFactor: capacityFactor ?? state.calculatorInputs.capacityFactor,
        electricityRate: electricityRate ?? state.calculatorInputs.electricityRate,
      },
    })),

    resetCalculatorToDefaults: () => set({
      calculatorInputs: { ...(get().energyType === 'wind' ? WIND_FINANCIAL_DEFAULTS : FINANCIAL_DEFAULTS) },
      selectedStateFips: null,
      selectedStateAbbr: null,
    }),

    // ─── Map Slice ───────────────────────────────────────────────────
    selectedState: null,  // { fips, name, abbr, ghi, capacityFactor, electricityRate, lat, lon }
    hoveredFips: null,

    setSelectedState: (state) => set({ selectedState: state }),
    setHoveredFips: (fips) => set({ hoveredFips: fips }),
    clearSelectedState: () => set({ selectedState: null }),

    // ─── Chat Slice ──────────────────────────────────────────────────
    chatMessages: [],
    isChatLoading: false,

    addChatMessage: (message) => set((state) => ({
      chatMessages: [...state.chatMessages, { ...message, id: Date.now() + Math.random() }],
    })),

    setChatLoading: (loading) => set({ isChatLoading: loading }),

    clearChat: () => set({ chatMessages: [] }),
  }))
)

export default useDashboardStore
