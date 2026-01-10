/**
 * Birth data input form component
 */

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Settings } from 'lucide-react';
import type { BirthData } from '../../types/astrology';

interface Props {
  onSubmit: (data: BirthData) => void;
  isLoading?: boolean;
}

// Common timezones
const TIMEZONES = [
  { value: 'Etc/GMT+4', label: 'UTC-4 (Eastern Daylight)' },
  { value: 'Etc/GMT+5', label: 'UTC-5 (Eastern Standard)' },
  { value: 'America/New_York', label: 'US Eastern' },
  { value: 'America/Los_Angeles', label: 'US Pacific' },
  { value: 'Europe/London', label: 'UK (GMT)' },
  { value: 'Europe/Helsinki', label: 'Finland (EET)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Colombo', label: 'Sri Lanka (SLST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'UTC', label: 'UTC' },
];

const AYANAMSAS = [
  { value: 'LAHIRI', label: 'Lahiri (Chitrapaksha)' },
  { value: 'KRISHNAMURTI', label: 'Krishnamurti (KP)' },
  { value: 'RAMAN', label: 'Raman' },
] as const;

export const BirthDataForm: React.FC<Props> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    latitude: '',
    longitude: '',
    timezone: 'Etc/GMT+4',
    ayanamsa: 'LAHIRI' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Combine date and time
    const dateTime = `${formData.date}T${formData.time}:00`;
    
    const birthData: BirthData = {
      date: dateTime,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      timezone: formData.timezone,
      ayanamsa: formData.ayanamsa,
      name: formData.name || undefined,
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
      latitude: preset.lat.toString(),
      longitude: preset.lng.toString(),
      timezone: preset.tz,
    }));
  };

  const inputClasses = "w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:border-cyber-500 focus:ring-1 focus:ring-cyber-500/30 outline-none transition-all";
  const labelClasses = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className={labelClasses}>
          Name (Optional)
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter name"
          className={inputClasses}
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClasses}>
            <Calendar className="inline w-4 h-4 mr-1.5 text-cyber-400" />
            Birth Date
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
            <Clock className="inline w-4 h-4 mr-1.5 text-cyber-400" />
            Birth Time
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
          Quick Locations
        </label>
        <div className="flex flex-wrap gap-2">
          {presetLocations.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setPresetLocation(preset)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-cyber-500/50 hover:text-cyber-400 transition-all"
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
            <MapPin className="inline w-4 h-4 mr-1.5 text-cyber-400" />
            Latitude
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
            <MapPin className="inline w-4 h-4 mr-1.5 text-cyber-400" />
            Longitude
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
          <Clock className="inline w-4 h-4 mr-1.5 text-cyber-400" />
          Timezone
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
          <Settings className="inline w-4 h-4 mr-1.5 text-cyber-400" />
          Ayanamsa
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
        className="w-full py-3.5 px-6 bg-gradient-to-r from-cyber-600 to-cyber-500 text-white font-semibold rounded-xl hover:from-cyber-500 hover:to-cyber-400 transform hover:scale-[1.02] transition-all shadow-neon hover:shadow-neon-strong disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none btn-glow"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Analyzing...
          </span>
        ) : (
          'Generate Chart'
        )}
      </button>
    </form>
  );
};
