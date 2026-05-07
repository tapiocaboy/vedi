/**
 * React hooks for chart data — all calculations run locally, no HTTP.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { BirthData, Chart, DashaTimeline, CurrentDasha } from '../types/astrology';
import * as api from '../services/api';

export function useChart(birthData: BirthData | null) {
  return useQuery<Chart, Error>({
    queryKey: ['chart', birthData],
    queryFn: () => api.generateChart(birthData!),
    enabled: !!birthData,
    staleTime: 1000 * 60 * 60,
  });
}

export function useDashaTimeline(birthData: BirthData | null, yearsAhead = 120) {
  return useQuery<DashaTimeline, Error>({
    queryKey: ['dasha-timeline', birthData, yearsAhead],
    queryFn: () => api.getDashaTimeline(birthData!, yearsAhead),
    enabled: !!birthData,
    staleTime: 1000 * 60 * 60,
  });
}

export function useCurrentDasha(birthData: BirthData | null, targetDate?: Date) {
  return useQuery<CurrentDasha, Error>({
    queryKey: ['current-dasha', birthData, targetDate?.toISOString()],
    queryFn: () => api.getCurrentDasha(birthData!, targetDate),
    enabled: !!birthData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGenerateChart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (birthData: BirthData) => api.generateChart(birthData),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['chart', variables], data);
    },
  });
}

/** Always returns healthy since everything runs locally */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: api.healthCheck,
    retry: false,
    staleTime: 1000 * 60 * 60,
  });
}
