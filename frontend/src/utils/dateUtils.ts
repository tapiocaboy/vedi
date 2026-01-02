/**
 * Date utility functions
 */

import { format, formatDistance, parseISO, isWithinInterval } from 'date-fns';

/**
 * Format a date string for display
 */
export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'MMM d, yyyy');
}

/**
 * Format a date with time
 */
export function formatDateTime(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'MMM d, yyyy HH:mm');
}

/**
 * Get relative time from now
 */
export function formatRelative(dateStr: string): string {
  const date = parseISO(dateStr);
  return formatDistance(date, new Date(), { addSuffix: true });
}

/**
 * Check if a date is within a period
 */
export function isDateInPeriod(
  date: Date,
  start: string,
  end: string
): boolean {
  return isWithinInterval(date, {
    start: parseISO(start),
    end: parseISO(end),
  });
}

/**
 * Format duration in years
 */
export function formatYears(years: number): string {
  if (years >= 1) {
    const wholeYears = Math.floor(years);
    const months = Math.round((years - wholeYears) * 12);
    if (months === 0) {
      return `${wholeYears} year${wholeYears !== 1 ? 's' : ''}`;
    }
    return `${wholeYears}y ${months}m`;
  }
  const months = Math.round(years * 12);
  if (months >= 1) {
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const days = Math.round(years * 365.25);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

/**
 * Format duration in days
 */
export function formatDays(days: number): string {
  if (days >= 365.25) {
    return formatYears(days / 365.25);
  }
  if (days >= 30) {
    const months = Math.round(days / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }
  const roundedDays = Math.round(days);
  return `${roundedDays} day${roundedDays !== 1 ? 's' : ''}`;
}

/**
 * Format degree with minutes
 */
export function formatDegree(degree: number): string {
  const deg = Math.floor(degree);
  const min = Math.floor((degree - deg) * 60);
  const sec = Math.round(((degree - deg) * 60 - min) * 60);
  return `${deg}°${min}'${sec}"`;
}

/**
 * Format degree simply
 */
export function formatDegreeSimple(degree: number): string {
  return `${degree.toFixed(2)}°`;
}

