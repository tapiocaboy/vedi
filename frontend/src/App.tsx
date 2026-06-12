import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, LayoutGrid, List, Stars, Zap, AlertCircle, Compass, Heart, Layers, CalendarDays } from 'lucide-react';

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
import { VargaTab } from './components/Varga/VargaTab';
import { PanchangaTab } from './components/Panchanga/PanchangaTab';
import { ExperimentalMatchModal } from './components/Match/ExperimentalMatchModal';
import { DisclaimerModal } from './components/DisclaimerModal';
import { PrivacyBanner } from './components/PrivacyBanner';
import { Logo, BrandTitle } from './components/Logo';
import { ParticleField } from './components/ParticleField';
import { useGenerateChart, useDashaTimeline, useHealthCheck } from './hooks/useChart';
import { LanguageProvider, useLang } from './i18n/LanguageContext';
import type { Lang } from './i18n/translations';
import type { BirthData, Chart } from './types/astrology';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

type ChartStyle = 'south' | 'north';
type ViewTab = 'chart' | 'yogas' | 'dasha' | 'now' | 'match' | 'insights' | 'vargas' | 'panchanga';

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
  const { lang, setLang, t } = useLang();


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
      className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide transition-all duration-200 whitespace-nowrap shrink-0 sm:flex-1 ${
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
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="hidden xs:inline sm:inline">{label}</span>
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

      {/* Ambient color orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 ambient-orbs" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{ background: isLight
            ? 'radial-gradient(circle, rgba(255,46,81,0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,46,81,0.07) 0%, transparent 70%)'
          }} />
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full blur-[160px]"
          style={{ background: isLight
            ? 'radial-gradient(circle, rgba(0,160,80,0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(0,255,135,0.05) 0%, transparent 70%)'
          }} />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[400px] rounded-full blur-[200px]"
          style={{ background: isLight
            ? 'radial-gradient(circle, rgba(200,170,0,0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,230,0,0.04) 0%, transparent 70%)'
          }} />
        <div className="absolute top-2/3 right-1/4 w-[350px] h-[350px] rounded-full blur-[150px]"
          style={{ background: isLight
            ? 'radial-gradient(circle, rgba(210,100,0,0.04) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,140,0,0.05) 0%, transparent 70%)'
          }} />
      </div>

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="relative z-10 border-b app-header sticky top-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Logo size={32} className="shrink-0 sm:w-10 sm:h-10" />
            <BrandTitle isLight={isLight} />
          </div>

          {/* Right side: status + language + theme toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isHealthError ? (
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400">
                <AlertCircle className="w-3 h-3" /> {t('header.offline')}
              </span>
            ) : health ? (
              <span className={`hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-mono ${
                isLight
                  ? 'bg-gray-100 border border-gray-200 text-gray-500'
                  : 'bg-white/4 border border-white/8 text-white/45'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#FF2E51' }} />
                v{health.version}
              </span>
            ) : null}

            {/* Language switch: English / Sinhala */}
            <div className={`flex items-center rounded-xl p-0.5 border ${
              isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/8'
            }`}>
              {([['en', 'EN'], ['si', 'සිං']] as [Lang, string][]).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  title={code === 'en' ? 'English' : 'සිංහල (Sinhala)'}
                  className={`px-2 sm:px-2.5 h-7 sm:h-8 rounded-[10px] text-[11px] sm:text-xs font-bold transition-all duration-200 ${
                    lang === code
                      ? 'text-white shadow-sm'
                      : isLight
                        ? 'text-gray-500 hover:text-gray-800'
                        : 'text-white/40 hover:text-white/70'
                  }`}
                  style={lang === code ? { backgroundColor: ACCENT } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={isLight ? t('header.themeToDark') : t('header.themeToLight')}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
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
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Left — Birth form */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden"
            >
              {/* Animated background — vivid color wash + fast particles */}
              <div className="absolute inset-0 pointer-events-none z-0 form-bg-particles">
                {/* Fast shifting multi-color gradient */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: isLight
                      ? 'linear-gradient(135deg, rgba(255,46,81,0.07), rgba(255,230,0,0.05), rgba(0,180,90,0.05), rgba(255,140,0,0.06), rgba(0,160,220,0.04))'
                      : 'linear-gradient(135deg, rgba(255,46,81,0.10), rgba(255,230,0,0.06), rgba(0,255,135,0.06), rgba(255,140,0,0.07), rgba(0,220,255,0.05))',
                    backgroundSize: '500% 500%',
                  }}
                  animate={{ backgroundPosition: ['0% 0%', '100% 30%', '60% 100%', '30% 60%', '0% 0%'] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                />
                {/* Sweeping color blobs */}
                <motion.div
                  className="absolute w-32 h-32 rounded-full blur-[50px]"
                  style={{ background: isLight ? 'rgba(255,46,81,0.10)' : 'rgba(255,46,81,0.14)' }}
                  animate={{ x: ['-20%', '120%'], y: ['10%', '70%'] }}
                  transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute w-28 h-28 rounded-full blur-[45px]"
                  style={{ background: isLight ? 'rgba(0,180,90,0.08)' : 'rgba(0,255,135,0.10)' }}
                  animate={{ x: ['110%', '-10%'], y: ['60%', '20%'] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute w-24 h-24 rounded-full blur-[40px]"
                  style={{ background: isLight ? 'rgba(210,180,0,0.08)' : 'rgba(255,230,0,0.08)' }}
                  animate={{ x: ['50%', '-20%', '80%'], y: ['80%', '10%', '50%'] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Fast moving particles — multi-direction */}
                {[
                  { x: '5%',  y: '20%', s: 3.5, c: '#FF2E51', dur: 2.5, dx: 30,  dy: -20 },
                  { x: '80%', y: '10%', s: 3,   c: '#FFE600', dur: 3,   dx: -25, dy: 15  },
                  { x: '60%', y: '75%', s: 3.5, c: '#00FF87', dur: 2.8, dx: 20,  dy: -25 },
                  { x: '20%', y: '85%', s: 3,   c: '#FF8C00', dur: 2.2, dx: -15, dy: -20 },
                  { x: '45%', y: '40%', s: 2.5, c: '#00D2FF', dur: 3.2, dx: 25,  dy: 10  },
                  { x: '90%', y: '50%', s: 3,   c: '#FF2E51', dur: 2.6, dx: -30, dy: -10 },
                  { x: '15%', y: '55%', s: 2.5, c: '#FFE600', dur: 2.4, dx: 20,  dy: 20  },
                  { x: '70%', y: '15%', s: 3.5, c: '#00FF87', dur: 3.5, dx: -20, dy: 25  },
                  { x: '35%', y: '90%', s: 3,   c: '#B43CFF', dur: 2.7, dx: 15,  dy: -30 },
                  { x: '55%', y: '30%', s: 2.5, c: '#FF8C00', dur: 3.0, dx: -25, dy: -15 },
                  { x: '85%', y: '65%', s: 2,   c: '#00D2FF', dur: 2.3, dx: 18,  dy: -22 },
                  { x: '30%', y: '5%',  s: 3,   c: '#FF2E51', dur: 2.9, dx: -18, dy: 28  },
                  { x: '50%', y: '60%', s: 2.5, c: '#FFE600', dur: 2.1, dx: 22,  dy: -18 },
                  { x: '10%', y: '35%', s: 3,   c: '#00FF87', dur: 3.3, dx: 28,  dy: 12  },
                  { x: '75%', y: '85%', s: 2.5, c: '#B43CFF', dur: 2.5, dx: -22, dy: -25 },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: p.x, top: p.y,
                      width: p.s, height: p.s,
                      backgroundColor: p.c,
                      boxShadow: `0 0 ${p.s * 4}px ${p.c}66`,
                    }}
                    animate={{
                      x: [0, p.dx, -p.dx * 0.6, p.dx * 0.3, 0],
                      y: [0, p.dy, -p.dy * 0.5, p.dy * 0.7, 0],
                      opacity: isLight ? [0.25, 0.5, 0.3, 0.45, 0.25] : [0.5, 0.9, 0.6, 0.85, 0.5],
                      scale: [1, 1.4, 0.9, 1.2, 1],
                    }}
                    transition={{ duration: p.dur, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ))}
              </div>

              <div className="relative z-10">
                <div className={`flex items-center gap-2.5 mb-6 pb-4 border-b ${isLight ? 'border-gray-150' : 'border-white/5'}`}
                  style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : undefined }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(255,46,81,0.10)', border: '1px solid rgba(255,46,81,0.22)' }}
                    animate={{ boxShadow: ['0 0 0px rgba(255,46,81,0)', '0 0 12px rgba(255,46,81,0.25)', '0 0 0px rgba(255,46,81,0)'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Moon className="w-4 h-4" style={{ color: ACCENT }} />
                  </motion.div>
                  <h2 className={`text-sm font-semibold tracking-wide ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {t('form.birthDetails')}
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
                    {generateChart.error?.message || t('form.error')}
                  </motion.div>
                )}
              </div>
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
                  <div className={`flex gap-1 backdrop-blur-sm rounded-xl p-1 border overflow-x-auto tab-bar-mobile ${
                    isLight ? 'bg-gray-100/80 border-gray-200' : 'bg-white/4 border-white/6'
                  }`}>
                    <TabBtn id="chart"    label={t('tab.chart')}    icon={LayoutGrid} />
                    <TabBtn id="dasha"    label={t('tab.timeline')} icon={List}       />
                    <TabBtn id="now"      label={t('tab.now')}      icon={Compass}    />
                    <TabBtn id="match"    label={t('tab.match')}    icon={Heart}      />
                    <TabBtn id="yogas"    label={t('tab.patterns')} icon={Stars}      />
                    <TabBtn id="vargas"   label={t('tab.vargas')}   icon={Layers}     />
                    <TabBtn id="panchanga" label={t('tab.panchanga')} icon={CalendarDays} />
                    <TabBtn id="insights" label={t('tab.insights')} icon={Zap}        />
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
                            {style === 'south' ? t('chart.southIndian') : t('chart.northIndian')}
                          </button>
                        ))}
                      </div>

                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        {chartStyle === 'south'
                          ? <SouthIndianChart planets={chartData.planets} ascendantRashi={chartData.ascendant.rashiIndex} />
                          : <NorthIndianChart  planets={chartData.planets} ascendantRashi={chartData.ascendant.rashiIndex} />
                        }
                      </div>

                      <NakshatraInfo nakshatra={chartData.moonNakshatra} />

                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <Sun className="w-4 h-4" style={{ color: '#FF2E51' }} />
                          {t('chart.planetaryPositions')}
                        </h3>
                        <PlanetTable planets={chartData.planets} ascendant={chartData.ascendant} />
                        <div className={`mt-4 pt-3 border-t flex justify-between items-center text-[10px] font-mono ${
                          isLight ? 'border-slate-200 text-slate-400' : 'border-white/5 text-white/20'
                        }`}>
                          <span>{t('chart.ayanamsaLabel')}: {chartData.birthData.ayanamsa}</span>
                          <span>{chartData.ayanamsaValue.toFixed(4)}°</span>
                        </div>
                      </div>

                      {birthData && <AshtakavargaGrid birthData={birthData} />}
                    </motion.div>
                  )}

                  {/* ── Dasha ─────────────────────────────────────── */}
                  {activeTab === 'dasha' && (
                    <motion.div key="dasha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        <CurrentDasha currentDasha={chartData.currentDasha} />
                      </div>
                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        {isDashaLoading ? (
                          <div className="text-center py-10">
                            <div className="spinner mx-auto mb-3" />
                            <span className={`font-mono text-sm ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                              {t('timeline.loading')}
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
                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        <div className="flex items-center gap-2.5 mb-1">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ background: 'rgba(255,46,81,0.08)', border: '1px solid rgba(255,46,81,0.18)' }}
                          >
                            <Stars className="w-4 h-4" style={{ color: '#ff6b81' }} />
                          </div>
                          <h3 className="text-sm font-semibold text-white">{t('patterns.title')}</h3>
                        </div>
                        <p className={`text-xs mb-5 ml-[2.625rem] ${isLight ? 'text-slate-400' : 'text-white/25'}`}>
                          {t('patterns.subtitle')}
                        </p>
                        <YogasDisplay birthData={birthData} />
                      </div>
                    </motion.div>
                  )}

                  {/* ── Vargas (divisional charts D9/D10) ─────────── */}
                  {activeTab === 'vargas' && birthData && (
                    <motion.div key="vargas" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <VargaTab birthData={birthData} />
                    </motion.div>
                  )}

                  {/* ── Panchanga (today's almanac + muhurta) ─────── */}
                  {activeTab === 'panchanga' && birthData && (
                    <motion.div key="panchanga" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <PanchangaTab birthData={birthData} />
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
                /* Empty state — animated */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="glass-card rounded-2xl p-6 sm:p-16 text-center relative overflow-hidden"
                >
                  {/* Animated gradient border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255,46,81,0.12), rgba(255,230,0,0.06), rgba(0,255,135,0.06), rgba(255,140,0,0.08))',
                      backgroundSize: '400% 400%',
                    }}
                    animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  />

                  <div className="relative z-10">
                    <motion.h3
                      className="text-2xl font-display font-bold text-white mb-3"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {t('empty.title')}
                    </motion.h3>
                    <motion.p
                      className={`max-w-sm mx-auto text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/50'}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                    >
                      {t('empty.body')}
                    </motion.p>

                    {/* Animated floating icons */}
                    <motion.div
                      className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-6 sm:mt-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      {[
                        { symbol: '☉', color: '#f59e0b', label: 'Sun' },
                        { symbol: '☽', color: '#94a3b8', label: 'Moon' },
                        { symbol: '♂', color: '#ef4444', label: 'Mars' },
                        { symbol: '♃', color: '#eab308', label: 'Jupiter' },
                        { symbol: '♀', color: '#f472b6', label: 'Venus' },
                        { symbol: '♄', color: '#38bdf8', label: 'Saturn' },
                      ].map((p, i) => (
                        <motion.div
                          key={p.label}
                          className="flex flex-col items-center gap-1"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2.5 + i * 0.3, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <span className="text-2xl" style={{ color: p.color, textShadow: `0 0 12px ${p.color}44` }}>{p.symbol}</span>
                          <span className={`text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-white/25'}`}>{p.label}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className={`relative z-10 mt-8 sm:mt-16 py-3 sm:py-4 border-t ${isLight ? 'border-slate-200' : 'border-white/4'}`}>
        <div className={`max-w-7xl mx-auto px-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-0 text-[9px] sm:text-[10px] font-mono ${
          isLight ? 'text-slate-500' : 'text-white/18'
        }`}>
          <span>trytellme.xyz · {t('footer.tagline')}</span>
          <span>{t('footer.nonCommercial')}</span>
          <span>{t('footer.algorithms')}</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </QueryClientProvider>
  );
}
