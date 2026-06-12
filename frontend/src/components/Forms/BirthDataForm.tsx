/**
 * Birth data input form component
 */

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Clock, Settings } from 'lucide-react';
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
  { value: 'LAHIRI', label: 'Lahiri (Chitrapaksha)' },
  { value: 'KRISHNAMURTI', label: 'Krishnamurti (KP)' },
  { value: 'RAMAN', label: 'Raman' },
] as const;

const LOCATION_KEY = 'vedi_location_prefs';

function loadSaved(): { latitude: string; longitude: string; timezone: string; ayanamsa: string } {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { latitude: '', longitude: '', timezone: 'Etc/GMT+4', ayanamsa: 'LAHIRI' };
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
    { name: 'New York', lat: 40.7128, lng: -74.0060, tz: 'America/New_York' },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
    { name: 'London', lat: 51.5074, lng: -0.1278, tz: 'Europe/London' },
    { name: 'Helsinki', lat: 60.1699, lng: 24.9384, tz: 'Europe/Helsinki' },
  ];

  const setPresetLocation = (preset: typeof presetLocations[0]) => {
    setFormData(prev => ({
      ...prev,
      latitude:  preset.lat.toString(),
      longitude: preset.lng.toString(),
      timezone:  preset.tz,
    }));
  };

  const inputClasses = "w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[15px] placeholder-white/30 focus:border-[#FF2E51]/60 focus:ring-1 focus:ring-[#FF2E51]/20 outline-none transition-all";
  const labelClasses = "block text-sm font-bold text-white/70 mb-2 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClasses}>
            <Calendar className="inline w-4.5 h-4.5 mr-1.5 text-[#FF2E51]" />
            {t('form.birthDate')}
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>
            <Clock className="inline w-4.5 h-4.5 mr-1.5 text-[#FF2E51]" />
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
          {presetLocations.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setPresetLocation(preset)}
              className="px-3.5 py-2 text-sm font-bold rounded-lg bg-white/5 text-white/60 border border-white/10 hover:border-[#FF2E51]/40 hover:text-[#FF2E51] transition-all"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClasses}>
            <MapPin className="inline w-4.5 h-4.5 mr-1.5 text-[#FF2E51]" />
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
            placeholder="e.g., 40.7128"
            className={inputClasses}
          />
        </div>
        <div>
          <label className={labelClasses}>
            <MapPin className="inline w-4.5 h-4.5 mr-1.5 text-[#FF2E51]" />
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
            placeholder="e.g., -74.0060"
            className={inputClasses}
          />
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className={labelClasses}>
          <Clock className="inline w-4.5 h-4.5 mr-1.5 text-[#FF2E51]" />
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
          <Settings className="inline w-4.5 h-4.5 mr-1.5 text-[#FF2E51]" />
          {t('form.ayanamsa')}
        </label>
        <select
          name="ayanamsa"
          value={formData.ayanamsa}
          onChange={handleChange}
          className={inputClasses}
        >
          {AYANAMSAS.map(ay => (
            <option key={ay.value} value={ay.value}>{ay.label}</option>
          ))}
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-6 text-white text-base font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#FF2E51' }}
        onMouseEnter={e => !isLoading && ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#e01f3d')}
        onMouseLeave={e => !isLoading && ((e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FF2E51')}
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
