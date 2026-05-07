/** Panchanga calculations — direct port of backend/src/core/panchanga.py */

export const TITHI_NAMES = [
  'Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami',
  'Shashthi','Saptami','Ashtami','Navami','Dashami',
  'Ekadashi','Dwadashi','Trayodashi','Chaturdashi','Purnima',
];

export const TITHI_LORDS = [
  'Sun','Moon','Mars','Mercury','Jupiter',
  'Venus','Saturn','Rahu','Sun','Moon',
  'Mars','Mercury','Jupiter','Venus','Saturn',
];

export const YOGA_NAMES = [
  'Vishkumbha','Priti','Ayushman','Saubhagya','Shobhana',
  'Atiganda','Sukarma','Dhriti','Shoola','Ganda',
  'Vriddhi','Dhruva','Vyaghata','Harshana','Vajra',
  'Siddhi','Vyatipata','Variyan','Parigha','Shiva',
  'Siddha','Sadhya','Shubha','Shukla','Brahma',
  'Indra','Vaidhriti',
];

export const YOGA_NATURE: Record<string, string> = {
  Vishkumbha:'malefic', Priti:'benefic', Ayushman:'benefic',
  Saubhagya:'benefic', Shobhana:'benefic', Atiganda:'malefic',
  Sukarma:'benefic', Dhriti:'benefic', Shoola:'malefic',
  Ganda:'malefic', Vriddhi:'benefic', Dhruva:'benefic',
  Vyaghata:'malefic', Harshana:'benefic', Vajra:'malefic',
  Siddhi:'benefic', Vyatipata:'malefic', Variyan:'benefic',
  Parigha:'malefic', Shiva:'benefic', Siddha:'benefic',
  Sadhya:'benefic', Shubha:'benefic', Shukla:'benefic',
  Brahma:'benefic', Indra:'benefic', Vaidhriti:'malefic',
};

export const MOVABLE_KARANAS = ['Bava','Balava','Kaulava','Taitila','Gara','Vanija','Vishti'];
export const FIXED_KARANAS = ['Shakuni','Chatushpada','Naga','Kimstughna'];

export const VARA_INFO: [number, string, string, string][] = [
  [0,'Sunday','Ravivara','Sun'],
  [1,'Monday','Somavara','Moon'],
  [2,'Tuesday','Mangalavara','Mars'],
  [3,'Wednesday','Budhavara','Mercury'],
  [4,'Thursday','Guruvara','Jupiter'],
  [5,'Friday','Shukravara','Venus'],
  [6,'Saturday','Shanivara','Saturn'],
];

// Segment index (1-based) of Rahu Kaal for each weekday (Sun–Sat)
export const RAHU_KAAL_SEGMENTS = [8, 2, 7, 5, 6, 4, 3];
export const GULIKA_SEGMENTS     = [7, 6, 5, 4, 3, 2, 1];

// Day-start Choghadiya index for each weekday
export const CHOGHADIYA = [
  ['Udveg','inauspicious','Sun'],
  ['Char','good','Venus'],
  ['Labh','good','Mercury'],
  ['Amrit','best','Moon'],
  ['Kaal','inauspicious','Saturn'],
  ['Shubh','good','Jupiter'],
  ['Rog','inauspicious','Mars'],
] as const;

export const DAY_START_CHOGHADIYA = [0, 3, 6, 2, 5, 1, 4];

export interface TithiInfo {
  number: number;
  name: string;
  paksha: string;
  lord: string;
  remainingDegrees: number;
  isPurnima: boolean;
  isAmavasya: boolean;
}

export interface PanchangaYogaInfo {
  number: number;
  name: string;
  nature: string;
  remainingDegrees: number;
}

export interface KaranaInfo {
  number: number;
  name: string;
  type: string;
}

export interface VaraInfo {
  number: number;
  name: string;
  sanskritName: string;
  lord: string;
}

export interface PanchangaResult {
  datetime: Date;
  tithi: TithiInfo;
  nakshatra: Record<string, unknown>;
  yoga: PanchangaYogaInfo;
  karana: KaranaInfo;
  vara: VaraInfo;
  rahuKaal: [Date, Date] | null;
  gulikaKaal: [Date, Date] | null;
  isAuspicious: boolean;
  specialNotes: string[];
}

function mod360(x: number): number { return ((x % 360) + 360) % 360; }

export class Panchanga {
  sunLon: number;
  moonLon: number;

  constructor(sunLongitude: number, moonLongitude: number) {
    this.sunLon = sunLongitude;
    this.moonLon = moonLongitude;
  }

  calculateTithi(): TithiInfo {
    const diff = mod360(this.moonLon - this.sunLon);
    const tithiNum = Math.floor(diff / 12) + 1;

    let paksha = 'Shukla';
    let tithiInPaksha = tithiNum;
    if (tithiNum > 15) {
      paksha = 'Krishna';
      tithiInPaksha = tithiNum - 15;
    }

    let name: string;
    if (tithiNum === 15) {
      name = 'Purnima';
    } else if (tithiNum === 30) {
      name = 'Amavasya';
      tithiInPaksha = 15;
    } else {
      name = TITHI_NAMES[(tithiInPaksha - 1) % 15];
    }

    const lord = TITHI_LORDS[(tithiNum - 1) % 15];
    const remaining = 12 - (diff % 12);

    return {
      number: tithiNum, name, paksha, lord,
      remainingDegrees: remaining,
      isPurnima: tithiNum === 15,
      isAmavasya: tithiNum === 30 || tithiNum === 0,
    };
  }

  calculateYoga(): PanchangaYogaInfo {
    const combined = mod360(this.sunLon + this.moonLon);
    const yogaSpan = 360 / 27;
    let yogaNum = Math.floor(combined / yogaSpan) + 1;
    if (yogaNum > 27) yogaNum = 1;
    const name = YOGA_NAMES[yogaNum - 1];
    return {
      number: yogaNum, name,
      nature: YOGA_NATURE[name],
      remainingDegrees: yogaSpan - (combined % yogaSpan),
    };
  }

  calculateKarana(): KaranaInfo {
    const diff = mod360(this.moonLon - this.sunLon);
    let karanaNum = Math.floor(diff / 6) + 1;
    if (karanaNum > 60) karanaNum = 1;

    let name: string, type: string;
    if (karanaNum === 1) {
      name = 'Kimstughna'; type = 'fixed';
    } else if (karanaNum >= 57) {
      name = FIXED_KARANAS[karanaNum - 57]; type = 'fixed';
    } else {
      name = MOVABLE_KARANAS[(karanaNum - 2) % 7]; type = 'movable';
    }
    return { number: karanaNum, name, type };
  }

  static calculateVara(date: Date): VaraInfo {
    const weekday = (date.getDay()); // 0=Sun
    const [num, name, sanskrit, lord] = VARA_INFO[weekday];
    return { number: num, name, sanskritName: sanskrit, lord };
  }

  static calculateRahuKaal(weekday: number, sunrise: Date, sunset: Date): [Date, Date] {
    const dayMs = sunset.getTime() - sunrise.getTime();
    const segMs = dayMs / 8;
    const seg = RAHU_KAAL_SEGMENTS[weekday] - 1;
    const start = new Date(sunrise.getTime() + segMs * seg);
    return [start, new Date(start.getTime() + segMs)];
  }

  static calculateGulikaKaal(weekday: number, sunrise: Date, sunset: Date): [Date, Date] {
    const dayMs = sunset.getTime() - sunrise.getTime();
    const segMs = dayMs / 8;
    const seg = GULIKA_SEGMENTS[weekday] - 1;
    const start = new Date(sunrise.getTime() + segMs * seg);
    return [start, new Date(start.getTime() + segMs)];
  }

  getPanchanga(
    date: Date,
    nakshatraInfo: Record<string, unknown>,
    sunrise?: Date,
    sunset?: Date
  ): PanchangaResult {
    const tithi = this.calculateTithi();
    const yoga = this.calculateYoga();
    const karana = this.calculateKarana();
    const vara = Panchanga.calculateVara(date);

    let rahuKaal: [Date, Date] | null = null;
    let gulikaKaal: [Date, Date] | null = null;
    if (sunrise && sunset) {
      rahuKaal = Panchanga.calculateRahuKaal(vara.number, sunrise, sunset);
      gulikaKaal = Panchanga.calculateGulikaKaal(vara.number, sunrise, sunset);
    }

    const isAuspicious = this._evaluateAuspiciousness(tithi, yoga, vara, nakshatraInfo);
    const specialNotes = this._getSpecialNotes(tithi, nakshatraInfo, vara);

    return { datetime: date, tithi, nakshatra: nakshatraInfo, yoga, karana, vara, rahuKaal, gulikaKaal, isAuspicious, specialNotes };
  }

  private _evaluateAuspiciousness(tithi: TithiInfo, yoga: PanchangaYogaInfo, vara: VaraInfo, nakshatra: Record<string, unknown>): boolean {
    let score = 0;
    const auspTithis = [2,3,5,7,10,11,13];
    if (auspTithis.includes(tithi.number) || auspTithis.includes(tithi.number - 15)) score++;
    if (yoga.nature === 'benefic') score++;
    else if (yoga.nature === 'malefic') score--;
    if (nakshatra.gana === 'Deva') score++;
    if ([1,5].includes(vara.number)) score++;
    return score >= 2;
  }

  private _getSpecialNotes(tithi: TithiInfo, nakshatra: Record<string, unknown>, vara: VaraInfo): string[] {
    const notes: string[] = [];
    if (tithi.isPurnima) notes.push('Purnima - Full Moon day, auspicious for rituals');
    if (tithi.isAmavasya) notes.push('Amavasya - New Moon day, good for ancestral rites');
    if (tithi.name === 'Ekadashi') notes.push('Ekadashi - Sacred fasting day');
    if (nakshatra.name === 'Pushya') notes.push('Pushya Nakshatra - Highly auspicious for most activities');
    if (vara.name === 'Thursday') notes.push('Guruvara - Auspicious for learning and spiritual activities');
    return notes;
  }
}

export class MuhurtaSelector {
  static getChoghadiya(weekday: number, sunrise: Date, sunset: Date) {
    const dayMs = sunset.getTime() - sunrise.getTime();
    const periodMs = dayMs / 8;
    const startIdx = DAY_START_CHOGHADIYA[weekday];
    return Array.from({ length: 8 }, (_, i) => {
      const [name, nature, lord] = CHOGHADIYA[(startIdx + i) % 7];
      const start = new Date(sunrise.getTime() + periodMs * i);
      const end = new Date(start.getTime() + periodMs);
      return { name, nature, lord, start, end, isGood: nature === 'good' || nature === 'best' };
    });
  }

  static getAbhijitMuhurta(sunrise: Date, sunset: Date) {
    const dayMs = sunset.getTime() - sunrise.getTime();
    const muhurtaMs = dayMs / 30;
    const noon = new Date(sunrise.getTime() + dayMs / 2);
    return {
      name: 'Abhijit Muhurta',
      start: new Date(noon.getTime() - muhurtaMs / 2),
      end: new Date(noon.getTime() + muhurtaMs / 2),
      durationMinutes: muhurtaMs / 60000,
      isAuspicious: true,
      effects: 'Destroys all doshas, highly auspicious for important activities',
    };
  }
}
