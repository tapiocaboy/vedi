/**
 * Birth data input form component
 */

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Sun } from 'lucide-react';
import type { BirthData } from '../../types/astrology';

interface Props {
  onSubmit: (data: BirthData) => void;
  isLoading?: boolean;
}

// Common timezones
const TIMEZONES = [
  { value: 'Asia/Colombo', label: 'Sri Lanka (SLST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Europe/Helsinki', label: 'Finland (EET)' },
  { value: 'America/New_York', label: 'US Eastern' },
  { value: 'America/Los_Angeles', label: 'US Pacific' },
  { value: 'Europe/London', label: 'UK (GMT)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Singapore', label: 'Singapore' },
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
    timezone: 'Asia/Colombo',
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
    { name: 'Colombo', lat: 6.9271, lng: 79.8612, tz: 'Asia/Colombo' },
    { name: 'Kandy', lat: 7.2906, lng: 80.6337, tz: 'Asia/Colombo' },
    { name: 'Kalutara', lat: 6.5854, lng: 79.9607, tz: 'Asia/Colombo' },
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-maroon-700 mb-2">
          Name (Optional)
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter name"
          className="w-full px-4 py-3 rounded-xl border-2 border-saffron-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all bg-white/80"
        />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-maroon-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Birth Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-saffron-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all bg-white/80"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-maroon-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Birth Time
          </label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border-2 border-saffron-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all bg-white/80"
          />
        </div>
      </div>

      {/* Quick Location Presets */}
      <div>
        <label className="block text-sm font-medium text-maroon-700 mb-2">
          Quick Locations
        </label>
        <div className="flex flex-wrap gap-2">
          {presetLocations.map(preset => (
            <button
              key={preset.name}
              type="button"
              onClick={() => setPresetLocation(preset)}
              className="px-3 py-1.5 text-sm rounded-full bg-saffron-100 text-saffron-700 hover:bg-saffron-200 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-maroon-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
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
            placeholder="e.g., 28.6139"
            className="w-full px-4 py-3 rounded-xl border-2 border-saffron-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all bg-white/80"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-maroon-700 mb-2">
            <MapPin className="inline w-4 h-4 mr-1" />
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
            placeholder="e.g., 77.2090"
            className="w-full px-4 py-3 rounded-xl border-2 border-saffron-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all bg-white/80"
          />
        </div>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-maroon-700 mb-2">
          Timezone
        </label>
        <select
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border-2 border-saffron-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all bg-white/80"
        >
          {TIMEZONES.map(tz => (
            <option key={tz.value} value={tz.value}>{tz.label}</option>
          ))}
        </select>
      </div>

      {/* Ayanamsa */}
      <div>
        <label className="block text-sm font-medium text-maroon-700 mb-2">
          <Sun className="inline w-4 h-4 mr-1" />
          Ayanamsa
        </label>
        <select
          name="ayanamsa"
          value={formData.ayanamsa}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-xl border-2 border-saffron-200 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-200 outline-none transition-all bg-white/80"
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
        className="w-full py-4 px-6 bg-gradient-to-r from-saffron-500 to-maroon-600 text-white font-semibold rounded-xl hover:from-saffron-600 hover:to-maroon-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Calculating...
          </span>
        ) : (
          'Generate Birth Chart'
        )}
      </button>
    </form>
  );
};

