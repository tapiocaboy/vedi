import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, LayoutGrid, List, Stars, Zap, AlertCircle, Compass, Heart } from 'lucide-react';

const ACCENT = '#FF2E51';

import { BirthDataForm } from './components/Forms/BirthDataForm';
import { SouthIndianChart } from './components/Chart/SouthIndianChart';
import { NorthIndianChart } from './components/Chart/NorthIndianChart';
import { PlanetTable } from './components/Chart/PlanetTable';
import { YogasDisplay } from './components/Chart/YogasDisplay';
import { AshtakavargaGrid } from './components/Chart/AshtakavargaGrid';
import { CurrentDasha } from './components/Dasha/CurrentDasha';
import { DashaTimeline } from './components/Dasha/DashaTimeline';
import { NakshatraInfo } from './components/Dasha/NakshatraInfo';
import { DeepInsights } from './components/Insights/DeepInsights';
import { CurrentPeriodTab } from './components/Period/CurrentPeriodTab';
import { MatchTab } from './components/Match/MatchTab';
import { ExperimentalMatchModal } from './components/Match/ExperimentalMatchModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { PrivacyBanner } from './components/PrivacyBanner';
import { Logo, BrandTitle } from './components/Logo';
import { ParticleField } from './components/ParticleField';
import { useGenerateChart, useDashaTimeline, useHealthCheck } from './hooks/useChart';
import type { BirthData, Chart } from './types/astrology';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

type ChartStyle = 'south' | 'north';
type ViewTab = 'chart' | 'yogas' | 'dasha' | 'now' | 'match' | 'insights';

function AppContent() {
  const [birthData, setBirthData]   = useState<BirthData | null>(null);
  const [chartStyle, setChartStyle] = useState<ChartStyle>('south');
  const [activeTab, setActiveTab]   = useState<ViewTab>('chart');
  const [chartData, setChartData]   = useState<Chart | null>(null);
  const [isLight, setIsLight]       = useState<boolean>(() => {
    const saved = localStorage.getItem('trytellme_theme') ?? localStorage.getItem('predictor_theme');
    return saved === 'light';
  });
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);
  const [matchExperimentalVisible, setMatchExperimentalVisible] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [privacyTrigger, setPrivacyTrigger] = useState<'load' | 'generate'>('load');
  const [pendingBirthData, setPendingBirthData] = useState<BirthData | null>(null);

  const generateChart = useGenerateChart();
  const { data: dashaTimeline, isLoading: isDashaLoading } = useDashaTimeline(birthData, 80);
  const { data: health, isError: isHealthError } = useHealthCheck();


  // Apply theme class to <html> so body background responds
  useEffect(() => {
    const root = document.documentElement;
    if (isLight) {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    } else {
      root.classList.remove('theme-light');
      root.classList.add('theme-dark');
    }
    localStorage.setItem('trytellme_theme', isLight ? 'light' : 'dark');
  }, [isLight]);

  const toggleTheme = () => setIsLight(v => !v);

  const runGenerate = async (data: BirthData) => {
    setBirthData(data);
    try {
      const result = await generateChart.mutateAsync(data);
      setChartData(result);
      setActiveTab('chart');
    } catch (err) {
      console.error('Failed to generate chart:', err);
    }
  };

  const handleSubmit = (data: BirthData) => {
    // Step 1: store data, open the "Before You Continue" disclaimer
    setPendingBirthData(data);
    setDisclaimerVisible(true);
  };

  const handleDisclaimerAccept = () => {
    // Step 2: disclaimer accepted → show privacy banner
    setDisclaimerVisible(false);
    setPrivacyTrigger('generate');
    setPrivacyVisible(true);
  };

  const handlePrivacyDismiss = () => {
    // Step 3: banner dismissed → run chart generation
    setPrivacyVisible(false);
    if (pendingBirthData) {
      const data = pendingBirthData;
      setPendingBirthData(null);
      runGenerate(data);
    }
  };

  const handleTabClick = (id: ViewTab) => {
    if (id === 'match') setMatchExperimentalVisible(true);
    setActiveTab(id);
  };

  const TabBtn = ({
    id, label, icon: Icon,
  }: { id: ViewTab; label: string; icon: React.ElementType }) => (
    <button
      onClick={() => handleTabClick(id)}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
        activeTab === id
          ? isLight
            ? 'text-white shadow-sm'
            : 'text-white shadow-sm'
          : isLight
            ? 'text-gray-500 hover:text-gray-800 hover:bg-white/70'
            : 'text-white/38 hover:text-white/65 hover:bg-white/5'
      }`}
      style={activeTab === id ? { backgroundColor: ACCENT } : undefined}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen tech-grid transition-colors duration-300 ${isLight ? 'theme-light' : ''}`}
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Disclaimer — shown on every Generate Chart press */}
      <DisclaimerModal visible={disclaimerVisible} onAccept={handleDisclaimerAccept} />

      {/* Experimental notice — shown when opening Match tab */}
      <ExperimentalMatchModal
        visible={matchExperimentalVisible}
        onDismiss={() => setMatchExperimentalVisible(false)}
      />

      {/* Privacy banner — shown on load + each generate */}
      <PrivacyBanner
        visible={privacyVisible}
        onDismiss={privacyTrigger === 'generate' ? handlePrivacyDismiss : () => setPrivacyVisible(false)}
        trigger={privacyTrigger}
      />

      {/* High-tech particle network — both themes */}
      <ParticleField isLight={isLight} />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b app-header sticky top-0">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} className="shrink-0" />
            <BrandTitle isLight={isLight} />
          </div>

          {/* Right side: status + theme toggle */}
          <div className="flex items-center gap-2">
            {isHealthError ? (
              <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400">
                <AlertCircle className="w-3 h-3" /> Offline
              </span>
            ) : health ? (
              <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-mono ${
                isLight
                  ? 'bg-gray-100 border border-gray-200 text-gray-500'
                  : 'bg-white/4 border border-white/8 text-white/45'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#FF2E51' }} />
                v{health.version}
              </span>
            ) : null}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                isLight
                  ? 'bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200'
                  : 'bg-white/5 border border-white/8 text-white/45 hover:bg-white/10 hover:text-white'
              }`}
            >
              {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Birth form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className={`flex items-center gap-2.5 mb-6 pb-4 border-b ${isLight ? 'border-gray-150' : 'border-white/5'}`}
                style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : undefined }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,46,81,0.10)', border: '1px solid rgba(255,46,81,0.22)' }}>
                  <Moon className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <h2 className={`text-sm font-semibold tracking-wide ${isLight ? 'text-gray-800' : 'text-white'}`}>
                  Birth Details
                </h2>
              </div>

              <BirthDataForm onSubmit={handleSubmit} isLoading={generateChart.isPending} />

              {generateChart.isError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-3 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {generateChart.error?.message || 'Failed to generate chart'}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right — Results */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {chartData ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Tab bar */}
                  <div className={`flex gap-1 backdrop-blur-sm rounded-xl p-1 border ${
                    isLight ? 'bg-gray-100/80 border-gray-200' : 'bg-white/4 border-white/6'
                  }`}>
                    <TabBtn id="chart"    label="Chart"    icon={LayoutGrid} />
                    <TabBtn id="dasha"    label="Timeline" icon={List}       />
                    <TabBtn id="now"      label="Now"      icon={Compass}    />
                    <TabBtn id="match"    label="Match"    icon={Heart}      />
                    <TabBtn id="yogas"    label="Patterns" icon={Stars}      />
                    <TabBtn id="insights" label="Insights" icon={Zap}        />
                  </div>

                  {/* ── Chart ─────────────────────────────────────── */}
                  {activeTab === 'chart' && (
                    <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="flex justify-center gap-2">
                        {(['south', 'north'] as ChartStyle[]).map(style => (
                          <button
                            key={style}
                            onClick={() => setChartStyle(style)}
                            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                              chartStyle === style
                                ? 'text-white'
                                : isLight
                                  ? 'bg-gray-100 text-gray-500 hover:text-gray-800 border border-gray-200'
                                  : 'bg-white/4 text-white/40 hover:text-white border border-white/8'
                            }`}
                            style={chartStyle === style ? { backgroundColor: ACCENT } : undefined}
                          >
                            {style === 'south' ? 'South Indian' : 'North Indian'}
                          </button>
                        ))}
                      </div>

                      <div className="glass-card rounded-2xl p-6">
                        {chartStyle === 'south'
                          ? <SouthIndianChart planets={chartData.planets} ascendantRashi={chartData.ascendant.rashiIndex} />
                          : <NorthIndianChart  planets={chartData.planets} ascendantRashi={chartData.ascendant.rashiIndex} />
                        }
                      </div>

                      <NakshatraInfo nakshatra={chartData.moonNakshatra} />

                      <div className="glass-card rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <Sun className="w-4 h-4" style={{ color: '#FF2E51' }} />
                          Planetary Positions
                        </h3>
                        <PlanetTable planets={chartData.planets} ascendant={chartData.ascendant} />
                        <div className={`mt-4 pt-3 border-t flex justify-between items-center text-[10px] font-mono ${
                          isLight ? 'border-slate-200 text-slate-400' : 'border-white/5 text-white/20'
                        }`}>
                          <span>Ayanamsa: {chartData.birthData.ayanamsa}</span>
                          <span>{chartData.ayanamsaValue.toFixed(4)}°</span>
                        </div>
                      </div>

                      {birthData && <AshtakavargaGrid birthData={birthData} />}
                    </motion.div>
                  )}

                  {/* ── Dasha ─────────────────────────────────────── */}
                  {activeTab === 'dasha' && (
                    <motion.div key="dasha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="glass-card rounded-2xl p-6">
                        <CurrentDasha currentDasha={chartData.currentDasha} />
                      </div>
                      <div className="glass-card rounded-2xl p-6">
                        {isDashaLoading ? (
                          <div className="text-center py-10">
                            <div className="spinner mx-auto mb-3" />
                            <span className={`font-mono text-sm ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                              Loading timeline…
                            </span>
                          </div>
                        ) : dashaTimeline ? (
                          <DashaTimeline timeline={dashaTimeline.timeline} birthData={birthData ?? undefined} />
                        ) : null}
                      </div>
                    </motion.div>
                  )}

                  {/* ── Now (current period + transits + relocation) ── */}
                  {activeTab === 'now' && birthData && (
                    <motion.div key="now" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <CurrentPeriodTab birthData={birthData} />
                    </motion.div>
                  )}

                  {/* ── Match (Horoscope compatibility) ──────────── */}
                  {activeTab === 'match' && birthData && (
                    <motion.div key="match" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <MatchTab person={birthData} />
                    </motion.div>
                  )}

                  {/* ── Patterns (Yogas) ──────────────────────────── */}
                  {activeTab === 'yogas' && birthData && (
                    <motion.div key="yogas" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="glass-card rounded-2xl p-6">
                        <div className="flex items-center gap-2.5 mb-1">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(255,46,81,0.08)', border: '1px solid rgba(255,46,81,0.18)' }}
                          >
                            <Stars className="w-4 h-4" style={{ color: '#ff6b81' }} />
                          </div>
                          <h3 className="text-sm font-semibold text-white">Planetary Patterns</h3>
                        </div>
                        <p className={`text-xs mb-5 ml-[2.625rem] ${isLight ? 'text-slate-400' : 'text-white/25'}`}>
                          Significant combinations detected in this birth chart
                        </p>
                        <YogasDisplay birthData={birthData} />
                      </div>
                    </motion.div>
                  )}

                  {/* ── Insights ──────────────────────────────────── */}
                  {activeTab === 'insights' && birthData && (
                    <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <DeepInsights birthData={birthData} />
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* Empty state */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-2xl p-16 text-center"
                >
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,46,81,0.08)', border: '1px solid rgba(255,46,81,0.15)' }}
                  >
                    <svg viewBox="0 0 48 48" className="w-10 h-10">
                      <circle cx="24" cy="24" r="6" fill="#FF2E51" />
                      <circle cx="24" cy="24" r="13" fill="none" stroke="#FF2E51" strokeWidth="0.8" strokeOpacity=".3" />
                      <circle cx="24" cy="24" r="21" fill="none" stroke="#FF2E51" strokeWidth="0.8" strokeOpacity=".12" />
                      <path d="M24 4l2 7 7 1-5 5 1.5 7L24 20l-5.5 4 1.5-7-5-5 7-1z" fill="#ff6b81" opacity=".8"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    Ready to Analyse Your Chart
                  </h3>
                  <p className={`max-w-xs mx-auto text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/30'}`}>
                    Enter your birth details to generate a complete birth chart with planetary period analysis, combination patterns, and detailed life predictions.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className={`relative z-10 mt-16 py-4 border-t ${isLight ? 'border-slate-200' : 'border-white/4'}`}>
        <div className={`max-w-7xl mx-auto px-5 flex items-center justify-between text-[10px] font-mono ${
          isLight ? 'text-slate-500' : 'text-white/18'
        }`}>
          <span>trytellme.xyz · Astrology predictions</span>
          <span>Non-Commercial Use Only</span>
          <span>Meeus algorithms · Lahiri ayanamsa</span>
        </div>
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
