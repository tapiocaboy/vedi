/**
 * TypeScript types for Vedic Astrology data structures
 */

export interface BirthData {
  date: string;  // ISO format
  latitude: number;
  longitude: number;
  timezone: string;
  ayanamsa: 'LAHIRI' | 'KRISHNAMURTI' | 'RAMAN';
  name?: string;
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

export interface CurrentDasha {
  targetDate: string;
  mahadasha: DashaPeriod;
  antardasha: AntardashaPeriod;
  pratyantardasha?: PratyantardashaPeriod;
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
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka',
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
  SUN: '#F59E0B',     // Amber
  MOON: '#E5E7EB',    // Gray
  MARS: '#EF4444',    // Red
  MERCURY: '#22C55E', // Green
  JUPITER: '#EAB308', // Yellow
  VENUS: '#EC4899',   // Pink
  SATURN: '#6366F1',  // Indigo
  RAHU: '#374151',    // Dark Gray
  KETU: '#78350F',    // Brown
  ASCENDANT: '#8B5CF6', // Purple
};

// Dasha colors
export const DASHA_COLORS: Record<string, string> = {
  Sun: 'bg-amber-400',
  Moon: 'bg-slate-200',
  Mars: 'bg-red-500',
  Mercury: 'bg-green-400',
  Jupiter: 'bg-yellow-400',
  Venus: 'bg-pink-300',
  Saturn: 'bg-indigo-600',
  Rahu: 'bg-gray-700',
  Ketu: 'bg-amber-700',
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

