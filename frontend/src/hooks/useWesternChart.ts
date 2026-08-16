/**
 * React hooks for the Western chart pipeline — mirrors `useChart.ts`'s shape
 * for the Vedic side. All calculations run locally, no HTTP.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BirthData } from '../types/astrology';
import type { WesternChart } from '../types/westernAstrology';
import * as api from '../services/api';

export function useGenerateWesternChart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (birthData: BirthData) => api.generateWesternChart(birthData),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['western-chart', variables], data);
    },
  });
}

export function useWesternChart(birthData: BirthData | null) {
  return useQuery<WesternChart, Error>({
    queryKey: ['western-chart', birthData],
    queryFn: () => api.generateWesternChart(birthData!),
    enabled: !!birthData,
    staleTime: 1000 * 60 * 60,
  });
}
