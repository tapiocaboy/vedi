/**
 * React hooks for chart data fetching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BirthData, Chart, DashaTimeline, CurrentDasha } from '../types/astrology';
import * as api from '../services/api';

/**
 * Hook to generate and cache a birth chart
 */
export function useChart(birthData: BirthData | null) {
  return useQuery<Chart, Error>({
    queryKey: ['chart', birthData],
    queryFn: () => api.generateChart(birthData!),
    enabled: !!birthData,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}

/**
 * Hook to get Dasha timeline
 */
export function useDashaTimeline(birthData: BirthData | null, yearsAhead: number = 120) {
  return useQuery<DashaTimeline, Error>({
    queryKey: ['dasha-timeline', birthData, yearsAhead],
    queryFn: () => api.getDashaTimeline(birthData!, yearsAhead),
    enabled: !!birthData,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Hook to get current Dasha periods
 */
export function useCurrentDasha(birthData: BirthData | null, targetDate?: Date) {
  return useQuery<CurrentDasha, Error>({
    queryKey: ['current-dasha', birthData, targetDate?.toISOString()],
    queryFn: () => api.getCurrentDasha(birthData!, targetDate),
    enabled: !!birthData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation hook for generating charts
 */
export function useGenerateChart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (birthData: BirthData) => api.generateChart(birthData),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['chart', variables], data);
    },
  });
}

/**
 * Hook for health check
 */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.healthCheck,
    retry: false,
    staleTime: 1000 * 30, // 30 seconds
  });
}

