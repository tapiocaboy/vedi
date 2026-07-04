/**
 * Birth data input form component
 */

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Clock, Settings, LocateFixed, Loader2 } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';
import type { BirthData } from '../../types/astrology';

interface Props {
  onSubmit: (data: BirthData) => void;
  isLoading?: boolean;
}

// All UTC offsets and common timezones
const TIMEZONES = [
  // UTC Offsets (negative - West of GMT)
  { value: 'Etc/GMT+12', label: 'UTC-12' },
  { value: 'Etc/GMT+11', label: 'UTC-11' },
  { value: 'Etc/GMT+10', label: 'UTC-10 (Hawaii)' },
  { value: 'Etc/GMT+9', label: 'UTC-9 (Alaska)' },
  { value: 'Etc/GMT+8', label: 'UTC-8 (Pacific Standard)' },
  { value: 'Etc/GMT+7', label: 'UTC-7 (Mountain Standard)' },
  { value: 'Etc/GMT+6', label: 'UTC-6 (Central Standard)' },
  { value: 'Etc/GMT+5', label: 'UTC-5 (Eastern Standard)' },
  { value: 'Etc/GMT+4', label: 'UTC-4 (Atlantic Standard)' },
  { value: 'Etc/GMT+3', label: 'UTC-3 (Brazil)' },
  { value: 'Etc/GMT+2', label: 'UTC-2' },
  { value: 'Etc/GMT+1', label: 'UTC-1 (Azores)' },
  // UTC
  { value: 'UTC', label: 'UTC+0 (GMT)' },
  // UTC Offsets (positive - East of GMT)
  { value: 'Etc/GMT-1', label: 'UTC+1 (Central European)' },
  { value: 'Etc/GMT-2', label: 'UTC+2 (Eastern European)' },
  { value: 'Etc/GMT-3', label: 'UTC+3 (Moscow)' },
  { value: 'Etc/GMT-4', label: 'UTC+4 (Gulf)' },
  { value: 'Etc/GMT-5', label: 'UTC+5 (Pakistan)' },
  { value: 'Asia/Kolkata', label: 'UTC+5:30 (India)' },
  { value: 'Etc/GMT-6', label: 'UTC+6 (Bangladesh)' },
  { value: 'Etc/GMT-7', label: 'UTC+7 (Indochina)' },
  { value: 'Etc/GMT-8', label: 'UTC+8 (China/Singapore)' },
  { value: 'Etc/GMT-9', label: 'UTC+9 (Japan/Korea)' },
  { value: 'Etc/GMT-10', label: 'UTC+10 (Australia Eastern)' },
  { value: 'Etc/GMT-11', label: 'UTC+11' },
  { value: 'Etc/GMT-12', label: 'UTC+12 (New Zealand)' },
  { value: 'Etc/GMT-13', label: 'UTC+13 (Samoa)' },
  { value: 'Etc/GMT-14', label: 'UTC+14 (Line Islands)' },
  // Named Timezones - Americas
  { value: 'America/New_York', label: 'New York (US Eastern)' },
  { value: 'America/Chicago', label: 'Chicago (US Central)' },
  { value: 'America/Denver', label: 'Denver (US Mountain)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (US Pacific)' },
  { value: 'America/Anchorage', label: 'Anchorage (Alaska)' },
  { value: 'America/Toronto', label: 'Toronto (Canada Eastern)' },
  { value: 'America/Vancouver', label: 'Vancouver (Canada Pacific)' },
  { value: 'America/Mexico_City', label: 'Mexico City' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (Brazil)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (Argentina)' },
  // Named Timezones - Europe
  { value: 'Europe/London', label: 'London (UK)' },
  { value: 'Europe/Paris', label: 'Paris (France)' },
  { value: 'Europe/Berlin', label: 'Berlin (Germany)' },
  { value: 'Europe/Rome', label: 'Rome (Italy)' },
  { value: 'Europe/Madrid', label: 'Madrid (Spain)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (Netherlands)' },
  { value: 'Europe/Brussels', label: 'Brussels (Belgium)' },
  { value: 'Europe/Zurich', label: 'Zurich (Switzerland)' },
  { value: 'Europe/Vienna', label: 'Vienna (Austria)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (Sweden)' },
  { value: 'Europe/Oslo', label: 'Oslo (Norway)' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (Denmark)' },
  { value: 'Europe/Helsinki', label: 'Helsinki (Finland)' },
  { value: 'Europe/Athens', label: 'Athens (Greece)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (Turkey)' },
  { value: 'Europe/Moscow', label: 'Moscow (Russia)' },
  { value: 'Europe/Kiev', label: 'Kyiv (Ukraine)' },
  { value: 'Europe/Warsaw', label: 'Warsaw (Poland)' },
  { value: 'Europe/Prague', label: 'Prague (Czech Republic)' },
  { value: 'Europe/Budapest', label: 'Budapest (Hungary)' },
  // Named Timezones - Asia
  { value: 'Asia/Dubai', label: 'Dubai (UAE)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (Saudi Arabia)' },
  { value: 'Asia/Tehran', label: 'Tehran (Iran)' },
  { value: 'Asia/Karachi', label: 'Karachi (Pakistan)' },
  { value: 'Asia/Kolkata', label: 'Kolkata/Mumbai (India)' },
  { value: 'Asia/Colombo', label: 'Colombo (Sri Lanka)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (Bangladesh)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (Thailand)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (Vietnam)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (Indonesia)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (Malaysia)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Shanghai', label: 'Shanghai (China)' },
  { value: 'Asia/Taipei', label: 'Taipei (Taiwan)' },
  { value: 'Asia/Seoul', label: 'Seoul (South Korea)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Japan)' },
  // Named Timezones - Oceania
  { value: 'Australia/Perth', label: 'Perth (Australia Western)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (Australia Central)' },
  { value: 'Australia/Sydney', label: 'Sydney (Australia Eastern)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (Australia)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (Australia)' },
  { value: 'Pacific/Auckland', label: 'Auckland (New Zealand)' },
  { value: 'Pacific/Fiji', label: 'Fiji' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (Hawaii)' },
  // Named Timezones - Africa
  { value: 'Africa/Cairo', label: 'Cairo (Egypt)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (South Africa)' },
  { value: 'Africa/Lagos', label: 'Lagos (Nigeria)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (Kenya)' },
  { value: 'Africa/Casablanca', label: 'Casablanca (Morocco)' },
];

const AYANAMSAS = [
  { value: 'LAHIRI', labelKey: 'form.ayanamsa.lahiri' as const },
  { value: 'KRISHNAMURTI', labelKey: 'form.ayanamsa.kp' as const },
  { value: 'RAMAN', labelKey: 'form.ayanamsa.raman' as const },
] as const;

const LOCATION_KEY = 'vedi_location_prefs';

// The visitor's own IANA timezone — a far better default than a fixed offset,
// and used to auto-set the zone when "Use my location" is tapped.
const BROWSER_TZ = (() => {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; }
})();
const BROWSER_TZ_IN_LIST = TIMEZONES.some(tz => tz.value === BROWSER_TZ) ? BROWSER_TZ : null;

function loadSaved(): { latitude: string; longitude: string; timezone: string; ayanamsa: string } {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { latitude: '', longitude: '', timezone: BROWSER_TZ_IN_LIST ?? 'UTC', ayanamsa: 'LAHIRI' };
}

/** "6.91° N" style coordinate readout. */
function fmtCoord(value: string, pos: string, neg: string): string | null {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return `${Math.abs(n).toFixed(2)}° ${n >= 0 ? pos : neg}`;
}

export const BirthDataForm: React.FC<Props> = ({ onSubmit, isLoading = false }) => {
  const { t } = useLang();
  const saved = useRef(loadSaved());

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    latitude:  saved.current.latitude,
    longitude: saved.current.longitude,
    timezone:  saved.current.timezone  || 'Etc/GMT+4',
    ayanamsa:  (saved.current.ayanamsa || 'LAHIRI') as 'LAHIRI' | 'KRISHNAMURTI' | 'RAMAN',
  });


  // Persist location fields whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LOCATION_KEY, JSON.stringify({
        latitude:  formData.latitude,
        longitude: formData.longitude,
        timezone:  formData.timezone,
        ayanamsa:  formData.ayanamsa,
      }));
    } catch {}
  }, [formData.latitude, formData.longitude, formData.timezone, formData.ayanamsa]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = `${formData.date}T${formData.time}:00`;
    const birthData: BirthData = {
      date: dateTime,
      latitude:  parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      timezone:  formData.timezone,
      ayanamsa:  formData.ayanamsa,
    };
    onSubmit(birthData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Preset locations
  const presetLocations = [
    { name: 'Kandy', lat: 7.2906, lng: 80.6337, tz: 'Asia/Colombo' },
    { name: 'Colombo', lat: 6.9271, lng: 79.8612, tz: 'Asia/Colombo' },
    { name: 'Borella', lat: 6.9148, lng: 79.8778, tz: 'Asia/Colombo' },
    { name: 'Peradeniya', lat: 7.2599, lng: 80.5977, tz: 'Asia/Colombo' },
    { name: 'Kalthota', lat: 6.5667, lng: 80.7833, tz: 'Asia/Colombo' },
    { name: 'Gampaha', lat: 7.0917, lng: 79.9999, tz: 'Asia/Colombo' },
    { name: 'London', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
  ];

  const setPresetLocation = (preset: typeof presetLocations[0]) => {
    setFormData(prev => ({
      ...prev,
      latitude:  preset.lat.toString(),
      longitude: preset.lng.toString(),
      timezone:  preset.tz,
    }));
  };

  // ── Geolocation: one-tap fill of coordinates + timezone ──────────────────────
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const useMyLocation = () => {
    if (!('geolocation' in navigator)) { setGeoError(t('form.geoUnsupported')); return; }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setFormData(prev => ({
          ...prev,
          latitude:  pos.coords.latitude.toFixed(4),
          longitude: pos.coords.longitude.toFixed(4),
          timezone:  BROWSER_TZ_IN_LIST ?? prev.timezone,
        }));
        setLocating(false);
      },
      err => {
        setGeoError(err.code === err.PERMISSION_DENIED ? t('form.geoDenied') : t('form.geoFailed'));
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const latReadout = fmtCoord(formData.latitude, 'N', 'S');
  const lngReadout = fmtCoord(formData.longitude, 'E', 'W');

  // Colour/size/background + native date-time legibility live in `.form-field`
  // (see index.css) so the date/time pickers render correctly on mobile and in
  // both themes; Tailwind here only handles layout + focus ring.
  const inputClasses = "form-field w-full px-4 py-3.5 rounded-xl font-bold focus:border-[rgba(var(--c-accent-rgb),0.6)] focus:ring-1 focus:ring-[rgba(var(--c-accent-rgb),0.2)] outline-none transition-all";
  const labelClasses = "form-label block text-sm font-bold mb-2 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClasses}>
            <Calendar className="inline w-4.5 h-4.5 mr-1.5 text-[var(--c-accent)]" />
            {t('form.birthDate')}
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            max={todayStr}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>
            <Clock className="inline w-4.5 h-4.5 mr-1.5 text-[var(--c-accent)]" />
            {t('form.birthTime')}
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>
      </div>

      {/* Quick Location Presets */}
      <div>
        <label className={labelClasses}>
          {t('form.quickLocations')}
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="preset-btn flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-lg text-[var(--c-accent)] hover:border-[rgba(var(--c-accent-rgb),0.4)] transition-all disabled:opacity-60"
            style={{ borderColor: 'rgba(var(--c-accent-rgb),0.35)' }}
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
            {locating ? t('form.locating') : t('form.useMyLocation')}
          </button>
          {presetLocations.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setPresetLocation(preset)}
              className="preset-btn px-3.5 py-2 text-sm font-bold rounded-lg hover:border-[rgba(var(--c-accent-rgb),0.4)] hover:text-[var(--c-accent)] transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
        {geoError && (
          <p className="mt-2 text-xs text-rose-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" /> {geoError}
          </p>
        )}
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClasses}>
            <MapPin className="inline w-4.5 h-4.5 mr-1.5 text-[var(--c-accent)]" />
            {t('form.latitude')}
          </label>
          <input
            type="number"
            name="latitude"
            value={formData.latitude}
            onChange={handleChange}
            required
            step="any"
            min="-90"
            max="90"
            placeholder={t('form.latitudePlaceholder')}
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>
            <MapPin className="inline w-4.5 h-4.5 mr-1.5 text-[var(--c-accent)]" />
            {t('form.longitude')}
          </label>
          <input
            type="number"
            name="longitude"
            value={formData.longitude}
            onChange={handleChange}
            required
            step="any"
            min="-180"
            max="180"
            placeholder={t('form.longitudePlaceholder')}
            className={inputClasses}
          />
        </div>
      </div>

      {/* Coordinate confirmation — reassures the user their point is set */}
      {latReadout && lngReadout && (
        <p className="-mt-2 flex items-center gap-1.5 text-xs form-label">
          <MapPin className="w-3.5 h-3.5 text-[var(--c-accent)] shrink-0" />
          <span className="font-bold">{latReadout}, {lngReadout}</span>
        </p>
      )}

      {/* Timezone */}
      <div>
        <label className={labelClasses}>
          <Clock className="inline w-4.5 h-4.5 mr-1.5 text-[var(--c-accent)]" />
          {t('form.timezone')}
        </label>
        <select
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          className={inputClasses}
        >
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Ayanamsa */}
      <div>
        <label className={labelClasses}>
          <Settings className="inline w-4.5 h-4.5 mr-1.5 text-[var(--c-accent)]" />
          {t('form.ayanamsa')}
        </label>
        <select
          name="ayanamsa"
          value={formData.ayanamsa}
          onChange={handleChange}
          className={inputClasses}
        >
          {AYANAMSAS.map(ay => (
            <option key={ay.value} value={ay.value}>{t(ay.labelKey)}</option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="on-accent w-full py-3.5 px-6 text-white text-base font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: 'var(--c-accent)' }}
        onMouseEnter={e => !isLoading && ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--c-accent-dark)')}
        onMouseLeave={e => !isLoading && ((e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--c-accent)')}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t('form.analyzing')}
          </span>
        ) : (
          t('form.generate')
        )}
      </button>
    </form>
  );
};
