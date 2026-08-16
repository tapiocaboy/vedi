/**
 * TypeScript types for Vedic Astrology data structures
 */

/**
 * `system` picks the astrology used for this chart. Optional (not required)
 * so every existing call site — saved localStorage prefs, tests, fixtures —
 * that predates this field keeps working; `resolveSystem()` below is the one
 * place that applies the 'VEDIC' default.
 */
export interface BirthData {
  date: string;  // ISO format
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsa: 'LAHIRI' | 'KRISHNAMURTI' | 'RAMAN';
  system?: 'VEDIC' | 'WESTERN';
}

/** `birthData.system` with the default applied — call this, not the raw field. */
export function resolveSystem(bd: Pick<BirthData, 'system'>): 'VEDIC' | 'WESTERN' {
  return bd.system === 'WESTERN' ? 'WESTERN' : 'VEDIC';
}

export interface NakshatraInfo {
  index: number;
  name: string;
  lord: string;
  pada: number;
  degree: number;
  deity?: string;
  symbol?: string;
  gana?: string;
}

export interface PlanetPosition {
  planet: string;
  longitude: number;
  latitude: number;
  rashi: string;
  rashiIndex: number;
  rashiDegree: number;
  nakshatra: string;
  nakshatraIndex: number;
  nakshatraPada: number;
  isRetrograde: boolean;
  speed: number;
}

export interface DashaPeriod {
  lord: string;
  start: string;  // ISO date
  end: string;    // ISO date
  durationYears: number;
  durationDays: number;
  isBirthDasha: boolean;
  antardashas?: AntardashaPeriod[];
}

export interface AntardashaPeriod {
  lord: string;
  start: string;
  end: string;
  durationDays: number;
  mahadashaLord: string;
}

export interface PratyantardashaPeriod {
  lord: string;
  start: string;
  end: string;
  durationDays: number;
  mahadashaLord: string;
  antardashaLord: string;
}

export interface SookshmaDashaPeriod {
  lord: string;
  start: string;
  end: string;
  durationDays: number;
  mahadashaLord: string;
  antardashaLord: string;
  pratyantarLord: string;
}

export interface CurrentDasha {
  targetDate: string;
  mahadasha: DashaPeriod;
  antardasha: AntardashaPeriod;
  pratyantardasha?: PratyantardashaPeriod;
  sookshmaDasha?: SookshmaDashaPeriod;
}

export interface DashaWithAntardashas {
  mahadasha: DashaPeriod;
  antardashas: AntardashaPeriod[];
}

export interface DashaTimeline {
  birthData: BirthData;
  moonNakshatra: NakshatraInfo;
  birthDashaLord: string;
  dashaBalance: {
    totalYears: number;
    elapsedYears: number;
    remainingYears: number;
    remainingDays: number;
  };
  timeline: DashaWithAntardashas[];
}

export interface Chart {
  birthData: BirthData;
  ayanamsaValue: number;
  planets: PlanetPosition[];
  ascendant: PlanetPosition;
  moonNakshatra: NakshatraInfo;
  currentDasha: CurrentDasha;
  mahadashaTimeline: DashaPeriod[];
}

// Rashi names
export const RASHIS = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Kataka',
  'Simha', 'Kanya', 'Tula', 'Vrischika',
  'Dhanu', 'Makara', 'Kumbha', 'Meena'
] as const;

export const RASHI_ENGLISH = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
] as const;

// Planet colors for visualization
export const PLANET_COLORS: Record<string, string> = {
  SUN:       '#a78bfa', // violet-400 — solar
  MOON:      '#e2e8f0', // slate-200  — lunar silver
  MARS:      '#ef4444', // red-500    — fiery
  MERCURY:   '#34d399', // emerald-400 — quick
  JUPITER:   '#c084fc', // purple-400 — guru
  VENUS:     '#f472b6', // pink-400   — feminine
  SATURN:    '#818cf8', // indigo-400 — karma
  RAHU:      '#6b7280', // gray-500   — shadow
  KETU:      '#7c3aed', // violet-700 — tail
  ASCENDANT: '#8b5cf6', // violet-500 — lagna
};

// Pale planet colors that vanish on a light background get darker stand-ins.
const PLANET_COLORS_LIGHT_OVERRIDE: Record<string, string> = {
  MOON: '#64748b',   // slate-500 — slate-200 is invisible on white
  MERCURY: '#059669', // emerald-600
  RAHU: '#4b5563',   // gray-600
};

/** Planet display color legible on the active theme background. */
export function planetDisplayColor(planet: string, isLight: boolean): string {
  const base = PLANET_COLORS[planet] ?? '#8b5cf6';
  return isLight ? (PLANET_COLORS_LIGHT_OVERRIDE[planet] ?? base) : base;
}

// Dasha planet color pills
export const DASHA_COLORS: Record<string, string> = {
  Sun:     'bg-violet-500',
  Moon:    'bg-slate-300',
  Mars:    'bg-red-600',
  Mercury: 'bg-emerald-500',
  Jupiter: 'bg-purple-500',
  Venus:   'bg-pink-500',
  Saturn:  'bg-indigo-500',
  Rahu:    'bg-gray-600',
  Ketu:    'bg-violet-700',
};

// Planet symbols
export const PLANET_SYMBOLS: Record<string, string> = {
  SUN: '☉',
  MOON: '☽',
  MARS: '♂',
  MERCURY: '☿',
  JUPITER: '♃',
  VENUS: '♀',
  SATURN: '♄',
  RAHU: '☊',
  KETU: '☋',
  ASCENDANT: 'Asc',
};

