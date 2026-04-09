/**
 * State-level renewable energy policy data.
 * Sources: DSIRE (dsireusa.org), EIA State Energy Profiles, NCSL.
 * Data reflects policy status as of early 2025. Verify before investment decisions.
 *
 * Fields:
 *   rps         - Renewable Portfolio Standard target (e.g. "50% by 2030"), null if none
 *   netMetering - 'full' | 'limited' | 'none' | 'virtual'
 *   propertyTax - Property tax exemption for renewable systems: true/false
 *   salesTax    - Sales tax exemption: true/false
 *   stateCredit - Notable state-level tax credit or incentive (string or null)
 *   notes       - Short policy highlight for analysts
 */
export const STATE_POLICIES = {
  AL: { rps: null,              netMetering: 'limited', propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'No RPS. Limited net metering via TVA Green Power Providers.' },
  AK: { rps: null,              netMetering: 'limited', propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'No statewide RPS. Rural Energy Fund supports remote renewables.' },
  AZ: { rps: '15% by 2025',    netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'APS & SRP offer competitive solar incentives. Strong net metering.' },
  AR: { rps: null,              netMetering: 'full',    propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'No RPS. Net metering available up to 300 kW.' },
  CA: { rps: '100% by 2045',   netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'NEM 3.0 in effect. Nation-leading clean energy mandate. SGIP battery incentive.' },
  CO: { rps: '100% by 2050',   netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Xcel Energy strong solar market. Community solar available statewide.' },
  CT: { rps: '48% by 2030',    netMetering: 'virtual', propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Virtual net metering available. Shared Clean Energy Facility program.' },
  DE: { rps: '40% by 2035',    netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Green Energy Fund provides rebates. Offshore wind procurements active.' },
  FL: { rps: null,              netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'No RPS but strong solar market. Property & sales tax exemptions for solar.' },
  GA: { rps: null,              netMetering: 'full',    propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'No RPS. Georgia Power Advanced Solar Initiative drives utility-scale growth.' },
  HI: { rps: '100% by 2045',   netMetering: 'limited', propertyTax: true,  salesTax: true,  stateCredit: '35% state tax credit',            notes: 'Generous 35% state tax credit. Net metering replaced by Smart Export.' },
  ID: { rps: null,              netMetering: 'full',    propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'No RPS. Net metering available up to 25 kW residential, 100 kW commercial.' },
  IL: { rps: '50% by 2040',    netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: 'Illinois Shines (SREC program)',  notes: 'Illinois Shines SREC incentive program. Community solar law enacted.' },
  IN: { rps: null,              netMetering: 'limited', propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'No RPS. Net metering grandfathered; new policy limits future credits.' },
  IA: { rps: '105 MW mandate',  netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Pioneer wind state. MidAmerican Energy 100% renewable by 2020.' },
  KS: { rps: null,              netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'No RPS (voluntary goal rescinded). Wind-friendly interconnection rules.' },
  KY: { rps: null,              netMetering: 'full',    propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'No RPS. Net metering capped at 30 kW residential.' },
  LA: { rps: null,              netMetering: 'full',    propertyTax: false, salesTax: false, stateCredit: '50% state solar tax credit',      notes: '50% state solar income tax credit (capped at $12,500). No RPS.' },
  ME: { rps: '80% by 2030',    netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Strong offshore wind ambitions. Community solar program active.' },
  MD: { rps: '50% by 2030',    netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'CleanEnergy Jobs Act. Offshore wind procurement leader on East Coast.' },
  MA: { rps: '40% by 2030',    netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: 'SMART solar incentive',           notes: 'SMART program offers long-term solar tariffs. Leading offshore wind state.' },
  MI: { rps: '60% by 2035',    netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'Clean Energy Plan signed 2023. Strong utility-scale solar pipeline.' },
  MN: { rps: '100% by 2040',   netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: '100% carbon-free by 2040. Community solar garden program statewide.' },
  MS: { rps: null,              netMetering: 'full',    propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'No RPS. Limited renewable incentives. Growing solar presence via IRA.' },
  MO: { rps: '15% by 2021',    netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'Moderate RPS achieved. Net metering up to 100 kW.' },
  MT: { rps: '15% by 2015',    netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'Excellent wind resource. Net metering up to 50 kW.' },
  NE: { rps: null,              netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'No RPS. Public power utilities dominate. Wind leader in MISO region.' },
  NV: { rps: '50% by 2030',    netMetering: 'limited', propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'NV Energy net metering restructured. Utility-scale solar dominant market.' },
  NH: { rps: '25.2% by 2025',  netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'Net metering up to 1 MW. Offshore wind interest growing.' },
  NJ: { rps: '50% by 2030',    netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: 'TREC/SuSI solar incentive',       notes: 'Transition Renewable Energy Certificate program. Major offshore wind state.' },
  NM: { rps: '50% by 2030',    netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: '10% state solar tax credit',      notes: '10% state solar credit. 100% carbon-free electricity by 2045.' },
  NY: { rps: '70% by 2030',    netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: '25% state solar tax credit',      notes: 'Climate Leadership Act. Leading offshore wind procurement. NYSERDA programs.' },
  NC: { rps: '12.5% by 2021',  netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Top 5 solar state. Duke Energy large solar portfolio. HB 951 grid modernization.' },
  ND: { rps: null,              netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'No RPS. Best wind resource in continental U.S. Wind friendly permitting.' },
  OH: { rps: '8.5% by 2026',   netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'Reduced RPS under HB 6. Significant wind capacity in northwest OH.' },
  OK: { rps: null,              netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'No RPS. Nation-leading wind state. Zero property tax for wind projects.' },
  OR: { rps: '50% by 2040',    netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'Community Solar program available. 100% carbon-free goal by 2040.' },
  PA: { rps: '18% by 2021',    netMetering: 'full',    propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'SREC market active. Net metering up to 50 kW residential, 3 MW commercial.' },
  RI: { rps: '100% by 2033',   netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Aggressive RPS. Offshore wind early mover (Block Island). Toray solar zone.' },
  SC: { rps: null,              netMetering: 'full',    propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'No RPS. Dominion & Duke Energy have voluntary clean energy goals.' },
  SD: { rps: '10% voluntary',  netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'Voluntary goal only. Excellent wind resource. Net metering up to 5 MW.' },
  TN: { rps: null,              netMetering: 'limited', propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'TVA territory — limited net metering. No RPS.' },
  TX: { rps: null,              netMetering: 'limited', propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'ERCOT grid. No statewide NEM mandate. Largest wind & solar market in U.S.' },
  UT: { rps: '20% by 2025',    netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'Rocky Mountain Power net metering. Major utility-scale solar growth.' },
  VT: { rps: '75% by 2032',    netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Strong net metering. Group net metering allows community projects.' },
  VA: { rps: '100% by 2045',   netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Virginia Clean Economy Act. Dominion offshore wind flagship project.' },
  WA: { rps: '100% by 2045',   netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Clean Energy Transformation Act. Hydro-dominant grid. Growing solar.' },
  WV: { rps: null,              netMetering: 'full',    propertyTax: false, salesTax: false, stateCredit: null,                              notes: 'No RPS. Coal-heavy grid transitioning. IRA investment opportunities.' },
  WI: { rps: '10% by 2015',    netMetering: 'full',    propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'Focus on Energy program offers rebates. Net metering up to 20 kW.' },
  WY: { rps: null,              netMetering: 'limited', propertyTax: true,  salesTax: false, stateCredit: null,                              notes: 'No RPS. Exceptional wind resource. Minimal net metering rules.' },
  DC: { rps: '100% by 2032',   netMetering: 'full',    propertyTax: true,  salesTax: true,  stateCredit: null,                              notes: 'Aggressive 100% RPS. Solar for All program for low-income residents.' },
}

export function getPolicyForState(abbr) {
  return STATE_POLICIES[abbr] ?? null
}

export function netMeteringLabel(status) {
  return {
    full:    'Full Net Metering',
    limited: 'Limited',
    virtual: 'Virtual NEM',
    none:    'None',
  }[status] ?? status
}
