/**
 * Planetary position calculations for Vedic Astrology
 * Based on Jean Meeus "Astronomical Algorithms" (VSOP87 truncated series)
 * Accuracy: Moon ~0.1°, Sun ~0.01°, Planets ~0.5-1°
 * Sufficient for Vedic astrology (nakshatra: 13.3° wide, house: 30° wide)
 */

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export interface PlanetPosition {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  rashi: number;
  rashiDegree: number;
  nakshatra: number;
  nakshatraPada: number;
  isRetrograde: boolean;
}

// Normalise angle to 0–360
function mod360(x: number): number {
  return ((x % 360) + 360) % 360;
}

// Julian Day from UTC components
export function datetimeToJD(
  year: number, month: number, day: number,
  hour = 0, minute = 0, second = 0
): number {
  const ut = hour + minute / 60 + second / 3600;
  let Y = year, M = month;
  const D = day + ut / 24;
  if (M <= 2) { Y--; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (Y + 4716)) +
         Math.floor(30.6001 * (M + 1)) +
         D + B - 1524.5;
}

/** Convert local datetime string to UTC Date using Intl */
export function localToUTC(localDateStr: string, timezone: string): Date {
  const [datePart, timePart = '00:00:00'] = localDateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const parts = timePart.replace('Z', '').split(':');
  const hour = parseInt(parts[0] || '0');
  const minute = parseInt(parts[1] || '0');
  const second = parseInt(parts[2] || '0');

  // Handle Etc/GMT±X (POSIX: Etc/GMT+5 = UTC−5)
  const etcMatch = timezone.match(/^Etc\/GMT([+-])(\d+)$/);
  if (etcMatch) {
    const sign = etcMatch[1] === '+' ? -1 : 1;
    const offsetMin = sign * parseInt(etcMatch[2]) * 60;
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second) - offsetMin * 60000);
  }
  if (timezone === 'UTC') {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  }

  // Named timezones: iterative convergence using Intl.DateTimeFormat
  let approx = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  const getLocal = (d: Date) => {
    const f = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const p = Object.fromEntries(f.formatToParts(d).map(x => [x.type, x.value]));
    return new Date(Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second));
  };

  for (let i = 0; i < 3; i++) {
    const localUtc = getLocal(approx);
    const target = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    const diff = target.getTime() - localUtc.getTime();
    approx = new Date(approx.getTime() + diff);
    if (Math.abs(diff) < 1000) break;
  }
  return approx;
}

// Ayanamsa at J2000.0 (degrees) for each system
const AYANAMSA_J2000: Record<string, number> = {
  LAHIRI: 23.85319,
  KRISHNAMURTI: 23.76687,
  RAMAN: 22.46128,
};
const PRECESSION_RATE_DEG_PER_YEAR = 50.2388 / 3600;

export function getAyanamsa(jd: number, system: 'LAHIRI' | 'KRISHNAMURTI' | 'RAMAN' = 'LAHIRI'): number {
  const T = (jd - 2451545.0) / 365.25;
  return AYANAMSA_J2000[system] + PRECESSION_RATE_DEG_PER_YEAR * T;
}

// Greenwich Mean Sidereal Time → Local Sidereal Time (degrees)
function getLocalSiderealTime(jd: number, lon: number): number {
  const T = (jd - 2451545.0) / 36525;
  const gmst = mod360(
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000
  );
  return mod360(gmst + lon);
}

// Mean obliquity of the ecliptic (Meeus Ch.22)
function getMeanObliquity(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 23.439291111 -
    0.013004167 * T -
    0.000000164 * T * T +
    0.000000504 * T * T * T;
}

// ─── Sun (Meeus Ch.27, accuracy ~0.01°) ─────────────────────────────────────
function getSunPosition(jd: number): { longitude: number; latitude: number; distance: number; speed: number } {
  const T = (jd - 2451545.0) / 36525;
  const L0 = mod360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = mod360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = M * D2R;
  const e = 0.016708634 - 0.000042037 * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
           + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
           + 0.000289 * Math.sin(3 * Mr);
  const sunLon = L0 + C;
  const omega = mod360(125.04 - 1934.136 * T);
  const apparent = mod360(sunLon - 0.00569 - 0.00478 * Math.sin(omega * D2R));
  const v = (M + C) * D2R;
  const dist = 1.000001018 * (1 - e * e) / (1 + e * Math.cos(v));
  // Sun speed: compute next-day difference
  const T2 = ((jd + 1) - 2451545.0) / 36525;
  const L02 = mod360(280.46646 + 36000.76983 * T2 + 0.0003032 * T2 * T2);
  const M2 = mod360(357.52911 + 35999.05029 * T2 - 0.0001537 * T2 * T2);
  const C2 = (1.914602 - 0.004817 * T2) * Math.sin(M2 * D2R)
            + (0.019993 - 0.000101 * T2) * Math.sin(2 * M2 * D2R);
  const sun2 = mod360(L02 + C2);
  let speed = sun2 - apparent;
  if (speed > 180) speed -= 360;
  if (speed < -180) speed += 360;
  return { longitude: apparent, latitude: 0, distance: dist, speed };
}

// ─── Moon (Meeus Ch.47, 28 main terms, accuracy ~0.1°) ──────────────────────
function getMoonPosition(jd: number): { longitude: number; latitude: number; distance: number; speed: number } {
  const T = (jd - 2451545.0) / 36525;
  const L  = mod360(218.3165 + 481267.8813 * T);
  const D  = mod360(297.8502 + 445267.1115 * T);
  const M  = mod360(357.5291 + 35999.0503 * T);
  const Mp = mod360(134.9634 + 477198.8676 * T);
  const F  = mod360(93.2721  + 483202.0175 * T);
  const Dr = D * D2R, Mr = M * D2R, Mpr = Mp * D2R, Fr = F * D2R;

  // Longitude perturbations (arcseconds)
  let dL = 0;
  dL += 6288774 * Math.sin(Mpr);
  dL += 1274027 * Math.sin(2*Dr - Mpr);
  dL += 658314  * Math.sin(2*Dr);
  dL += 213618  * Math.sin(2*Mpr);
  dL -= 185116  * Math.sin(Mr);
  dL -= 114332  * Math.sin(2*Fr);
  dL += 58793   * Math.sin(2*Dr - 2*Mpr);
  dL += 57066   * Math.sin(2*Dr - Mr - Mpr);
  dL += 53322   * Math.sin(2*Dr + Mpr);
  dL += 45758   * Math.sin(2*Dr - Mr);
  dL -= 40923   * Math.sin(Mr - Mpr);
  dL -= 34720   * Math.sin(Dr);
  dL -= 30383   * Math.sin(Mr + Mpr);
  dL += 15327   * Math.sin(2*Dr - 2*Fr);
  dL -= 12528   * Math.sin(Mpr + 2*Fr);
  dL += 10980   * Math.sin(Mpr - 2*Fr);
  dL += 10675   * Math.sin(4*Dr - Mpr);
  dL += 10034   * Math.sin(3*Mpr);
  dL += 8548    * Math.sin(4*Dr - 2*Mpr);
  dL -= 7888    * Math.sin(2*Dr + Mr - Mpr);
  dL -= 6766    * Math.sin(2*Dr + Mr);
  dL -= 5163    * Math.sin(Dr - Mpr);
  dL += 4987    * Math.sin(Dr + Mr);
  dL += 4036    * Math.sin(2*Dr - Mr + Mpr);
  dL += 3994    * Math.sin(2*Dr + 2*Mpr);
  dL += 3861    * Math.sin(4*Dr);
  dL += 3665    * Math.sin(2*Dr - 3*Mpr);
  dL -= 2689    * Math.sin(Mr - 2*Mpr);

  const longitude = mod360(L + dL / 1000000);

  // Latitude
  let dB = 0;
  dB += 5128122 * Math.sin(Fr);
  dB += 280602  * Math.sin(Mpr + Fr);
  dB += 277693  * Math.sin(Mpr - Fr);
  dB += 173237  * Math.sin(2*Dr - Fr);
  dB += 55413   * Math.sin(2*Dr - Mpr + Fr);
  dB -= 46271   * Math.sin(2*Dr - Mpr - Fr);
  dB -= 32573   * Math.sin(2*Dr + Fr);
  const latitude = dB / 1000000;

  // Distance (AU)
  let dR = 0;
  dR -= 20905355 * Math.cos(Mpr);
  dR -= 3699111  * Math.cos(2*Dr - Mpr);
  dR -= 2955968  * Math.cos(2*Dr);
  const distKm = 385000.56 + dR / 1000;
  const distance = distKm / 149597870.7;

  // Speed: next-day difference
  const T2 = ((jd + 1) - 2451545.0) / 36525;
  const L2  = mod360(218.3165 + 481267.8813 * T2);
  const D2  = mod360(297.8502 + 445267.1115 * T2);
  const M2  = mod360(357.5291 + 35999.0503 * T2);
  const Mp2 = mod360(134.9634 + 477198.8676 * T2);
  let dL2 = 6288774 * Math.sin(Mp2*D2R) + 1274027 * Math.sin((2*D2 - Mp2)*D2R)
            + 658314 * Math.sin(2*D2*D2R) + 213618 * Math.sin(2*Mp2*D2R)
            - 185116 * Math.sin(M2*D2R);
  const lon2 = mod360(L2 + dL2 / 1000000);
  let speed = lon2 - longitude;
  if (speed > 180) speed -= 360;
  if (speed < -180) speed += 360;

  return { longitude, latitude, distance, speed };
}

// ─── Outer planets via Kepler + VSOP87 orbital elements ─────────────────────
// From Meeus Table 31.a (J2000.0 values and rates per Julian century)
interface OrbElements { a:number; ad:number; e:number; ed:number; i:number; id:number; L:number; Ld:number; w:number; wd:number; O:number; Od:number; }
const PLANETS_OE: Record<string, OrbElements> = {
  MERCURY: { a:0.38709927,ad:0.00000037, e:0.20563593,ed:0.00001906, i:7.00497902,id:-0.00594749, L:252.25032350,Ld:149472.67411175, w:77.45779628,wd:0.16047689, O:48.33076593,Od:-0.12534081 },
  VENUS:   { a:0.72333566,ad:0.00000390, e:0.00677672,ed:-0.00004107, i:3.39467605,id:-0.00078890, L:181.97909950,Ld:58517.81538729, w:131.60246718,wd:0.00268329, O:76.67984255,Od:-0.27769418 },
  MARS:    { a:1.52371034,ad:0.00001847, e:0.09339410,ed:0.00007882, i:1.84969142,id:-0.00813131, L:-4.55343205,Ld:19140.30268499, w:-23.94362959,wd:0.44441088, O:49.55953891,Od:-0.29257343 },
  JUPITER: { a:5.20288700,ad:-0.00011607, e:0.04838624,ed:-0.00013253, i:1.30439695,id:-0.00183714, L:34.39644051,Ld:3034.74612775, w:14.72847983,wd:0.21252668, O:100.47390909,Od:0.20469106 },
  SATURN:  { a:9.53667594,ad:-0.00125060, e:0.05386179,ed:-0.00050991, i:2.48599187,id:0.00193609, L:49.95424423,Ld:1222.49362201, w:92.59887831,wd:-0.41897216, O:113.66242448,Od:-0.28867794 },
};

function solveKepler(M_deg: number, e: number): number {
  let E = M_deg * D2R;
  const M = M_deg * D2R;
  for (let i = 0; i < 50; i++) {
    const dE = (M - E + e * Math.sin(E)) / (1 - e * Math.cos(E));
    E += dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

function heliocentricXYZ(el: OrbElements, T: number): [number, number, number, number] {
  const a = el.a + el.ad * T;
  const e = el.e + el.ed * T;
  const i = (el.i + el.id * T) * D2R;
  const L = mod360(el.L + el.Ld * T);
  const wbar = mod360(el.w + el.wd * T);
  const Omega = mod360(el.O + el.Od * T);
  const M = mod360(L - wbar);
  const omega = (wbar - mod360(el.O + el.Od * T) + 360) % 360;

  const E = solveKepler(M, e);
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
  const r = a * (1 - e * Math.cos(E));

  const omegaR = omega * D2R;
  const OmegaR = Omega * D2R;
  const u = omegaR + nu;
  const x = r * (Math.cos(OmegaR) * Math.cos(u) - Math.sin(OmegaR) * Math.sin(u) * Math.cos(i));
  const y = r * (Math.sin(OmegaR) * Math.cos(u) + Math.cos(OmegaR) * Math.sin(u) * Math.cos(i));
  const z = r * Math.sin(i) * Math.sin(u);
  return [x, y, z, r];
}

function getEarthXYZ(jd: number): [number, number, number] {
  const sun = getSunPosition(jd);
  const sunLonR = (sun.longitude + 180) * D2R; // Earth = opposite of Sun
  const r = sun.distance;
  return [r * Math.cos(sunLonR), r * Math.sin(sunLonR), 0];
}

function getPlanetGeocentricLonLat(planet: string, jd: number): { longitude: number; latitude: number; distance: number } {
  const T = (jd - 2451545.0) / 36525;
  const [px, py, pz] = heliocentricXYZ(PLANETS_OE[planet], T);
  const [ex, ey, ez] = getEarthXYZ(jd);
  const gx = px - ex, gy = py - ey, gz = pz - ez;
  const dist = Math.sqrt(gx*gx + gy*gy + gz*gz);
  const longitude = mod360(Math.atan2(gy, gx) * R2D);
  const latitude = Math.asin(gz / dist) * R2D;
  return { longitude, latitude, distance: dist };
}

function getOuterPlanetPosition(planet: string, jd: number): { longitude: number; latitude: number; distance: number; speed: number } {
  const pos1 = getPlanetGeocentricLonLat(planet, jd);
  const pos2 = getPlanetGeocentricLonLat(planet, jd + 1);
  let speed = pos2.longitude - pos1.longitude;
  if (speed > 180) speed -= 360;
  if (speed < -180) speed += 360;
  return { ...pos1, speed };
}

// ─── Mean Lunar Node (Rahu) ───────────────────────────────────────────────────
function getMeanLunarNode(jd: number): { longitude: number; speed: number } {
  const T = (jd - 2451545.0) / 36525;
  const longitude = mod360(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
  return { longitude, speed: -0.052954 };
}

// ─── Ascendant ────────────────────────────────────────────────────────────────
export function getAscendantLongitude(jd: number, lat: number, lon: number): number {
  const lstDeg = getLocalSiderealTime(jd, lon);
  const lstR = lstDeg * D2R;
  const eR = getMeanObliquity(jd) * D2R;
  const latR = lat * D2R;
  const y = Math.cos(lstR);
  const x = -(Math.sin(lstR) * Math.cos(eR) + Math.tan(latR) * Math.sin(eR));
  return mod360(Math.atan2(y, x) * R2D);
}

// ─── Rashi / Nakshatra helpers ────────────────────────────────────────────────
function getRashiFromLon(lon: number): { rashi: number; rashiDegree: number } {
  const l = mod360(lon);
  return { rashi: Math.floor(l / 30), rashiDegree: l % 30 };
}

const NAKSHATRA_SPAN = 360 / 27;
const PADA_SPAN = NAKSHATRA_SPAN / 4;
function getNakshatraFromLon(lon: number): { nakshatra: number; nakshatraPada: number } {
  const l = mod360(lon);
  const idx = Math.min(Math.floor(l / NAKSHATRA_SPAN), 26);
  const deg = l % NAKSHATRA_SPAN;
  const pada = Math.min(Math.floor(deg / PADA_SPAN) + 1, 4);
  return { nakshatra: idx, nakshatraPada: pada };
}

function buildPosition(lon: number, lat: number, dist: number, speed: number): PlanetPosition {
  const slon = mod360(lon);
  const { rashi, rashiDegree } = getRashiFromLon(slon);
  const { nakshatra, nakshatraPada } = getNakshatraFromLon(slon);
  return { longitude: slon, latitude: lat, distance: dist, speed, rashi, rashiDegree, nakshatra, nakshatraPada, isRetrograde: speed < 0 };
}

// ─── Main entry point ─────────────────────────────────────────────────────────
export function getPlanetPositions(
  dateStr: string,
  latitude: number,
  longitude: number,
  timezone: string,
  ayanamsa: 'LAHIRI' | 'KRISHNAMURTI' | 'RAMAN' = 'LAHIRI'
): Record<string, PlanetPosition> {
  const utcDate = localToUTC(dateStr, timezone);
  const jd = datetimeToJD(
    utcDate.getUTCFullYear(), utcDate.getUTCMonth() + 1, utcDate.getUTCDate(),
    utcDate.getUTCHours(), utcDate.getUTCMinutes(), utcDate.getUTCSeconds()
  );
  const ay = getAyanamsa(jd, ayanamsa);

  const calcSidereal = (tropLon: number) => mod360(tropLon - ay);

  // Sun
  const sun = getSunPosition(jd);
  // Moon
  const moon = getMoonPosition(jd);
  // Outer planets
  const mercury = getOuterPlanetPosition('MERCURY', jd);
  const venus    = getOuterPlanetPosition('VENUS',   jd);
  const mars     = getOuterPlanetPosition('MARS',    jd);
  const jupiter  = getOuterPlanetPosition('JUPITER', jd);
  const saturn   = getOuterPlanetPosition('SATURN',  jd);
  // Rahu (mean node)
  const rahu = getMeanLunarNode(jd);
  // Ketu = Rahu + 180
  const ketuLon = mod360(rahu.longitude + 180);

  // Ascendant (tropical → sidereal)
  const ascTropical = getAscendantLongitude(jd, latitude, longitude);

  const positions: Record<string, PlanetPosition> = {};

  positions.SUN       = buildPosition(calcSidereal(sun.longitude), sun.latitude, sun.distance, sun.speed);
  positions.MOON      = buildPosition(calcSidereal(moon.longitude), moon.latitude, moon.distance, moon.speed);
  positions.MERCURY   = buildPosition(calcSidereal(mercury.longitude), mercury.latitude, mercury.distance, mercury.speed);
  positions.VENUS     = buildPosition(calcSidereal(venus.longitude), venus.latitude, venus.distance, venus.speed);
  positions.MARS      = buildPosition(calcSidereal(mars.longitude), mars.latitude, mars.distance, mars.speed);
  positions.JUPITER   = buildPosition(calcSidereal(jupiter.longitude), jupiter.latitude, jupiter.distance, jupiter.speed);
  positions.SATURN    = buildPosition(calcSidereal(saturn.longitude), saturn.latitude, saturn.distance, saturn.speed);
  positions.RAHU      = buildPosition(calcSidereal(rahu.longitude), 0, 0, rahu.speed);
  positions.KETU      = buildPosition(calcSidereal(ketuLon), 0, 0, rahu.speed);
  positions.ASCENDANT = buildPosition(calcSidereal(ascTropical), 0, 0, 0);
  // Mark Ketu as retrograde (it always moves retrograde, same direction as Rahu)
  positions.KETU = { ...positions.KETU, isRetrograde: true };
  positions.RAHU = { ...positions.RAHU, isRetrograde: true };

  return positions;
}

export function getAyanamsaValue(dateStr: string, timezone: string, ayanamsa: 'LAHIRI' | 'KRISHNAMURTI' | 'RAMAN' = 'LAHIRI'): number {
  const utc = localToUTC(dateStr, timezone);
  const jd = datetimeToJD(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate(), utc.getUTCHours(), utc.getUTCMinutes(), utc.getUTCSeconds());
  return getAyanamsa(jd, ayanamsa);
}
