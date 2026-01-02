/**
 * Main Application Component
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, LayoutGrid, List, AlertCircle, Sparkles } from 'lucide-react';

import { BirthDataForm } from './components/Forms/BirthDataForm';
import { SouthIndianChart } from './components/Chart/SouthIndianChart';
import { NorthIndianChart } from './components/Chart/NorthIndianChart';
import { PlanetTable } from './components/Chart/PlanetTable';
import { CurrentDasha } from './components/Dasha/CurrentDasha';
import { DashaTimeline } from './components/Dasha/DashaTimeline';
import { NakshatraInfo } from './components/Dasha/NakshatraInfo';
import { CurrentPrediction } from './components/Dasha/CurrentPrediction';
import { useGenerateChart, useDashaTimeline, useHealthCheck } from './hooks/useChart';
import type { BirthData, Chart } from './types/astrology';

// Create QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

type ChartStyle = 'south' | 'north';
type ViewTab = 'chart' | 'dasha' | 'predictions';

function AppContent() {
  const [birthData, setBirthData] = useState<BirthData | null>(null);
  const [chartStyle, setChartStyle] = useState<ChartStyle>('south');
  const [activeTab, setActiveTab] = useState<ViewTab>('chart');
  const [chartData, setChartData] = useState<Chart | null>(null);

  // API hooks
  const generateChart = useGenerateChart();
  const { data: dashaTimeline, isLoading: isDashaLoading } = useDashaTimeline(
    birthData,
    80 // 80 years ahead
  );
  const { data: health, isError: isHealthError } = useHealthCheck();

  const handleSubmit = async (data: BirthData) => {
    setBirthData(data);
    try {
      const result = await generateChart.mutateAsync(data);
      setChartData(result);
    } catch (error) {
      console.error('Failed to generate chart:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 bg-vedic-pattern">
      {/* Header */}
      <header className="bg-gradient-to-r from-maroon-700 to-maroon-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-saffron-400 to-saffron-600 flex items-center justify-center">
                <Moon className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold tracking-tight">Vedi</h1>
                <p className="text-sm opacity-80 font-body">Vedic Astrology</p>
              </div>
            </div>
            
            {/* API Status */}
            <div className="flex items-center gap-2 text-sm">
              {isHealthError ? (
                <span className="flex items-center gap-1 text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  API Offline
                </span>
              ) : health ? (
                <span className="flex items-center gap-1 text-green-300">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  API v{health.version}
                </span>
              ) : (
                <span className="text-gray-300">Connecting...</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-saffron-100"
            >
              <h2 className="text-xl font-display font-semibold text-maroon-800 mb-6">
                Birth Details
              </h2>
              <BirthDataForm 
                onSubmit={handleSubmit} 
                isLoading={generateChart.isPending} 
              />
              
              {generateChart.isError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  <AlertCircle className="inline w-4 h-4 mr-2" />
                  {generateChart.error?.message || 'Failed to generate chart'}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {chartData ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Tabs */}
                  <div className="flex gap-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-sm">
                    <button
                      onClick={() => setActiveTab('chart')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                        activeTab === 'chart'
                          ? 'bg-saffron-500 text-white'
                          : 'text-gray-600 hover:bg-saffron-100'
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      Birth Chart
                    </button>
                    <button
                      onClick={() => setActiveTab('dasha')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                        activeTab === 'dasha'
                          ? 'bg-saffron-500 text-white'
                          : 'text-gray-600 hover:bg-saffron-100'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      Dasha Timeline
                    </button>
                    <button
                      onClick={() => setActiveTab('predictions')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                        activeTab === 'predictions'
                          ? 'bg-saffron-500 text-white'
                          : 'text-gray-600 hover:bg-saffron-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      Predictions
                    </button>
                  </div>

                  {activeTab === 'chart' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Chart Style Toggle */}
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setChartStyle('south')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            chartStyle === 'south'
                              ? 'bg-maroon-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          South Indian
                        </button>
                        <button
                          onClick={() => setChartStyle('north')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            chartStyle === 'north'
                              ? 'bg-maroon-600 text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          North Indian
                        </button>
                      </div>

                      {/* Chart */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-saffron-100">
                        {chartStyle === 'south' ? (
                          <SouthIndianChart
                            planets={chartData.planets}
                            ascendantRashi={chartData.ascendant.rashiIndex}
                          />
                        ) : (
                          <NorthIndianChart
                            planets={chartData.planets}
                            ascendantRashi={chartData.ascendant.rashiIndex}
                          />
                        )}
                      </div>

                      {/* Nakshatra Info */}
                      <NakshatraInfo nakshatra={chartData.moonNakshatra} />

                      {/* Planet Table */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-saffron-100">
                        <h3 className="text-lg font-display font-semibold text-maroon-800 mb-4">
                          Planetary Positions
                        </h3>
                        <PlanetTable
                          planets={chartData.planets}
                          ascendant={chartData.ascendant}
                        />
                        <div className="mt-3 text-xs text-gray-500 text-right">
                          Ayanamsa ({chartData.birthData.ayanamsa}): {chartData.ayanamsaValue.toFixed(4)}°
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'dasha' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {/* Current Dasha */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-saffron-100">
                        <CurrentDasha currentDasha={chartData.currentDasha} />
                      </div>

                      {/* Dasha Timeline */}
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-saffron-100">
                        {isDashaLoading ? (
                          <div className="text-center py-8 text-gray-500">
                            <div className="animate-spin w-8 h-8 border-4 border-saffron-500 border-t-transparent rounded-full mx-auto mb-3" />
                            Loading timeline...
                          </div>
                        ) : dashaTimeline ? (
                          <DashaTimeline timeline={dashaTimeline.timeline} birthData={birthData} />
                        ) : null}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'predictions' && birthData && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <CurrentPrediction birthData={birthData} />
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-saffron-100 text-center"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-saffron-100 to-maroon-100 flex items-center justify-center">
                    <Sun className="w-12 h-12 text-saffron-500" />
                  </div>
                  <h3 className="text-xl font-display font-semibold text-maroon-800 mb-2">
                    Enter Birth Details
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Fill in the birth date, time, and location to generate a complete 
                    Vedic birth chart with Vimshottari Dasha timeline.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 bg-maroon-900 text-white/60 text-center text-sm">
        <p>
          Vedi - Vedic Astrology Calculator • Using Swiss Ephemeris for accurate calculations
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

