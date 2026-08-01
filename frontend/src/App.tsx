import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { Moon, Sun, Presentation, Droplet, Check, ChevronDown, LayoutGrid, List, Stars, Zap, AlertCircle, Compass, Heart, Layers, Share2, CalendarRange, Orbit, Download, MessageCircle, ShieldAlert, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const ACCENT = 'var(--c-accent)';

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
import { KnowledgeGraph } from './components/Graph/KnowledgeGraph';
import { DoshaTab } from './components/Dosha/DoshaTab';
import { ExperimentalMatchModal } from './components/Match/ExperimentalMatchModal';
import { MonthlyTransitsModal } from './components/Transits/MonthlyTransitsModal';
import { NatalChartModal } from './components/Natal/NatalChartModal';
import { FavourableForecast } from './components/Forecast/FavourableForecast';
import { HoroscopeChat } from './components/Chat/HoroscopeChat';
import { downloadChartMarkdown } from './lib/core/exportChart';
import { isChatConfigured } from './services/horoscopeChat';
import { DisclaimerModal } from './components/DisclaimerModal';
import { WelcomeLegalModal } from './components/WelcomeLegalModal';
import { PrivacyBanner } from './components/PrivacyBanner';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { Logo, BrandTitle } from './components/Logo';
import { ParticleField } from './components/ParticleField';
import { LagnaIntro } from './components/LagnaIntro';
import { useGenerateChart, useDashaTimeline, useHealthCheck } from './hooks/useChart';
import { LanguageProvider, useLang } from './i18n/LanguageContext';
import type { Lang } from './i18n/translations';
import type { BirthData, Chart } from './types/astrology';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

type ChartStyle = 'south' | 'north';
type ViewTab = 'chart' | 'yogas' | 'dasha' | 'now' | 'match' | 'insights' | 'vargas' | 'graph' | 'doshas';
type Theme = 'dark' | 'light' | 'mono' | 'azure';

function AppContent() {
  const [birthData, setBirthData]   = useState<BirthData | null>(null);
  const [chartStyle, setChartStyle] = useState<ChartStyle>('south');
  const [activeTab, setActiveTab]   = useState<ViewTab>('chart');
  const [chartData, setChartData]   = useState<Chart | null>(null);
  const [theme, setTheme]           = useState<Theme>(() => {
    const saved = localStorage.getItem('trytellme_theme') ?? localStorage.getItem('predictor_theme');
    return saved === 'mono' ? 'mono' : saved === 'azure' ? 'azure' : saved === 'light' ? 'light' : 'dark';
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  // "mono" is the chalkboard theme — it rides on the DARK layout (a blackboard
  // is a dark surface), so it counts as not-light here and in useTheme().
  const isLight = theme !== 'dark' && theme !== 'mono';
  // Hide all chat affordances when the NVIDIA key is missing/empty.
  const chatConfigured = isChatConfigured();
  // Legal gate — shown on every site load / refresh / first visit
  const [welcomeLegalVisible, setWelcomeLegalVisible] = useState(true);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);
  const [matchExperimentalVisible, setMatchExperimentalVisible] = useState(false);
  const [monthlyTransitsVisible, setMonthlyTransitsVisible] = useState(false);
  const [natalChartVisible, setNatalChartVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [privacyTrigger, setPrivacyTrigger] = useState<'load' | 'generate'>('load');
  // Cookie consent (Google Analytics) — asked once per device, persisted.
  const [cookieConsentVisible, setCookieConsentVisible] = useState(
    () => localStorage.getItem('trytellme_cookie_consent') === null
  );
  const [pendingBirthData, setPendingBirthData] = useState<BirthData | null>(null);
  // Ascendant sign being revealed by the particle intro, or null when idle.
  const [lagnaIntroRashi, setLagnaIntroRashi] = useState<number | null>(null);

  const generateChart = useGenerateChart();
  const { data: dashaTimeline, isLoading: isDashaLoading } = useDashaTimeline(birthData, 80);
  const { isError: isHealthError } = useHealthCheck();
  const { lang, setLang, t } = useLang();


  // Apply theme classes to <html> so body background + tokens respond.
  // "mono" is the chalkboard: it rides on top of the DARK layout and repaints
  // the surface as a school blackboard with chalk-coloured ink.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-dark', theme === 'dark' || theme === 'mono');
    // "azure" rides on top of the light layout.
    root.classList.toggle('theme-light', theme === 'light' || theme === 'azure');
    root.classList.toggle('theme-mono', theme === 'mono');
    root.classList.toggle('theme-azure', theme === 'azure');
    localStorage.setItem('trytellme_theme', theme);
  }, [theme]);

  const themeOptions: { id: Theme; label: string; icon: React.ElementType }[] = [
    { id: 'dark',  label: t('theme.dark'),  icon: Moon },
    { id: 'light', label: t('theme.light'), icon: Sun },
    { id: 'azure', label: t('theme.azure'), icon: Droplet },
    { id: 'mono',  label: t('theme.mono'),  icon: Presentation },
  ];
  const activeTheme = themeOptions.find(o => o.id === theme) ?? themeOptions[0];

  const runGenerate = async (data: BirthData) => {
    setBirthData(data);
    try {
      const result = await generateChart.mutateAsync(data);
      setChartData(result);
      setActiveTab('chart');
      // Reveal the lagna as particles before the chart is seen. The chart
      // mounts underneath straight away; the overlay simply covers it until the
      // figure has dispersed. Skipped for the motionless chalkboard theme and
      // for anyone who asked for reduced motion.
      const wantsMotion =
        theme !== 'mono' &&
        !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (wantsMotion) setLagnaIntroRashi(result.ascendant.rashiIndex);
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

  const handleCookieConsent = (granted: boolean) => {
    localStorage.setItem('trytellme_cookie_consent', granted ? 'granted' : 'denied');
    if (granted) {
      window.gtag?.('consent', 'update', { analytics_storage: 'granted' });
    }
    setCookieConsentVisible(false);
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
    // Match runs entirely on the local ephemeris — no API key involved — so it
    // is always available. The experimental notice still shows on entry.
    if (id === 'match') setMatchExperimentalVisible(true);
    setActiveTab(id);
  };

  const TabBtn = ({
    id, label, icon: Icon,
  }: { id: ViewTab; label: string; icon: React.ElementType }) => (
    <button
      onClick={() => handleTabClick(id)}
      // min-h-[40px] on touch: the tab strip was ~32px tall, under a comfortable
      // tap target. Desktop keeps the tighter height.
      className={`relative flex items-center justify-center gap-1 sm:gap-1.5 min-h-[40px] sm:min-h-0 py-2.5 sm:py-2.5 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide transition-colors duration-200 whitespace-nowrap shrink-0 sm:flex-1 ${
        activeTab === id
          ? 'text-white on-accent'
          : isLight
            ? 'text-gray-500 hover:text-gray-800 hover:bg-white/70'
            : 'text-white/38 hover:text-white/65 hover:bg-white/5'
      }`}
    >
      {activeTab === id && (
        <motion.span
          layoutId="active-tab-pill"
          className="absolute inset-0 rounded-lg shadow-sm"
          style={{ backgroundColor: ACCENT }}
          transition={{ type: 'spring', stiffness: 480, damping: 38 }}
        />
      )}
      <Icon className="relative z-10 w-3.5 h-3.5 shrink-0" />
      <span className="relative z-10 hidden xs:inline sm:inline">{label}</span>
    </button>
  );

  return (
    <MotionConfig
      reducedMotion={theme === 'mono' ? 'always' : 'never'}
      transition={theme === 'mono' ? { duration: 0 } : undefined}
    >
    <div className={`min-h-screen tech-grid transition-colors duration-300 ${isLight ? 'theme-light' : ''}`}
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Legal gate — shown on every site load / refresh / first visit.
          Accepting it surfaces the "your data stays on your device" banner. */}
      <WelcomeLegalModal
        visible={welcomeLegalVisible}
        onAccept={() => {
          setWelcomeLegalVisible(false);
          setPrivacyTrigger('load');
          setPrivacyVisible(true);
        }}
      />

      {/* Disclaimer — shown on every Generate Chart press */}
      <DisclaimerModal visible={disclaimerVisible} onAccept={handleDisclaimerAccept} />

      {/* Lagna particle reveal — plays over the freshly mounted chart */}
      <LagnaIntro rashiIndex={lagnaIntroRashi} onDone={() => setLagnaIntroRashi(null)} />

      {/* Experimental notice — shown when opening Match tab */}
      <ExperimentalMatchModal
        visible={matchExperimentalVisible}
        onDismiss={() => setMatchExperimentalVisible(false)}
      />

      {/* Monthly transits — sign changes this month + their effects */}
      <MonthlyTransitsModal
        visible={monthlyTransitsVisible}
        onClose={() => setMonthlyTransitsVisible(false)}
        chart={chartData}
      />

      {/* Natal chart — full birth-chart reading, line by line */}
      <NatalChartModal
        visible={natalChartVisible}
        onClose={() => setNatalChartVisible(false)}
        birthData={birthData}
      />

      {/* AI chat — ask questions about the horoscope (NVIDIA Nemotron) */}
      <HoroscopeChat
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        chart={chartData}
      />

      {/* Floating chat button — bottom right, when a chart exists and the
          NVIDIA key is configured (hidden entirely if the key is missing/empty) */}
      {chartData && chatConfigured && !chatVisible && (
        <button
          onClick={() => setChatVisible(true)}
          title={t('chat.title')}
          aria-label={t('chat.title')}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg on-accent transition-transform hover:scale-105"
          style={{ backgroundColor: ACCENT, boxShadow: '0 8px 28px rgba(var(--c-accent-rgb),0.45)' }}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Privacy banner — shown on load + each generate */}
      <PrivacyBanner
        visible={privacyVisible}
        onDismiss={privacyTrigger === 'generate' ? handlePrivacyDismiss : () => setPrivacyVisible(false)}
        trigger={privacyTrigger}
      />

      {/* Cookie consent — asked once, after the welcome legal modal closes */}
      <CookieConsentBanner
        visible={cookieConsentVisible && !welcomeLegalVisible}
        onAccept={() => handleCookieConsent(true)}
        onDecline={() => handleCookieConsent(false)}
      />

      {/* High-tech particle network — dark & light themes only (mono is static) */}
      {theme !== 'mono' && <ParticleField isLight={isLight} />}

      {/* Ambient color orbs — hidden in the mono enterprise theme */}
      {theme !== 'mono' && (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 ambient-orbs" aria-hidden>
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[180px]"
          style={{ background: isLight
            ? 'radial-gradient(circle, rgba(var(--c-accent-rgb),0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(var(--c-accent-rgb),0.07) 0%, transparent 70%)'
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
      )}

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="sticky z-30 border-b app-header top-0">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Logo size={32} className="shrink-0 sm:w-10 sm:h-10" />
            <BrandTitle isLight={isLight} />
          </div>

          {/* Middle: favourability forecast — how long until a good window */}
          <FavourableForecast
            chart={chartData}
            isLight={isLight}
            onClick={() => setMonthlyTransitsVisible(true)}
          />

          {/* Right side: status + language + theme toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isHealthError && (
              <span className="hidden sm:flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/25 text-red-400">
                <AlertCircle className="w-3 h-3" /> {t('header.offline')}
              </span>
            )}

            {/* Natal chart — full birth-chart reading */}
            <button
              onClick={() => setNatalChartVisible(true)}
              title={t('natal.title')}
              className={`flex items-center gap-1.5 text-xs px-2.5 sm:px-3 h-8 sm:h-9 rounded-xl font-semibold transition-all duration-200 ${
                isLight
                  ? 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  : 'bg-white/5 border border-white/8 text-white/55 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Orbit className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">{t('header.natalChart')}</span>
            </button>

            {/* Export — download the full chart as Markdown (needs a chart) */}
            {chartData && (
              <button
                onClick={() => downloadChartMarkdown(chartData)}
                title={t('header.exportTitle')}
                className="btn-cta btn-cta-blink flex items-center gap-1.5 text-xs px-3 h-9 rounded-xl font-bold transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden xs:inline">{t('header.export')}</span>
              </button>
            )}

            {/* Monthly transits — replaces the old version badge */}
            <button
              onClick={() => setMonthlyTransitsVisible(true)}
              title={t('monthly.title')}
              className={`flex items-center gap-1.5 text-xs px-2.5 sm:px-3 h-8 sm:h-9 rounded-xl font-semibold transition-all duration-200 ${
                isLight
                  ? 'bg-gray-100 border border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  : 'bg-white/5 border border-white/8 text-white/55 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--c-accent)' }} />
              <CalendarRange className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden xs:inline">{t('header.monthlyTransits')}</span>
            </button>

            {/* Language switch: English / Sinhala */}
            <div className={`flex items-center rounded-xl p-0.5 border ${
              isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/8'
            }`}>
              {([['en', 'EN'], ['si', 'සිං']] as [Lang, string][]).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  title={code === 'en' ? t('lang.englishTitle') : t('lang.sinhalaTitle')}
                  className={`relative px-2 sm:px-2.5 h-7 sm:h-8 rounded-[10px] text-[11px] sm:text-xs font-bold transition-colors duration-200 ${
                    lang === code
                      ? 'text-white on-accent'
                      : isLight
                        ? 'text-gray-500 hover:text-gray-800'
                        : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {lang === code && (
                    <motion.span
                      layoutId="lang-pill"
                      className="absolute inset-0 rounded-[10px] shadow-sm"
                      style={{ backgroundColor: ACCENT }}
                      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>

            {/* Theme picker — Dark / Light / Black & White */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(o => !o)}
                title={t('header.theme')}
                aria-haspopup="menu"
                aria-expanded={themeMenuOpen}
                className={`h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center gap-1 transition-all duration-200 ${
                  isLight
                    ? 'bg-gray-100 border border-gray-200 text-gray-500 hover:bg-gray-200'
                    : 'bg-white/5 border border-white/8 text-white/45 hover:bg-white/10 hover:text-white'
                }`}
              >
                <activeTheme.icon className="w-4 h-4" />
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${themeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
              {themeMenuOpen && (
                <>
                  {/* click-away catcher */}
                  <div className="fixed inset-0 z-40" onClick={() => setThemeMenuOpen(false)} aria-hidden />
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute right-0 mt-2 w-44 z-50 origin-top-right rounded-xl border p-1 shadow-xl backdrop-blur-md ${
                      isLight
                        ? 'bg-white border-gray-200'
                        : 'bg-[#0e111e]/95 border-white/10'
                    }`}
                  >
                    {themeOptions.map(({ id, label, icon: Icon }) => {
                      const selected = id === theme;
                      return (
                        <button
                          key={id}
                          role="menuitemradio"
                          aria-checked={selected}
                          onClick={() => { setTheme(id); setThemeMenuOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                            selected
                              ? isLight ? 'bg-gray-100 text-gray-900' : 'bg-white/10 text-white'
                              : isLight ? 'text-gray-600 hover:bg-gray-50' : 'text-white/60 hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="flex-1 text-left">{label}</span>
                          {selected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--c-accent)' }} />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${sidebarHidden ? '' : 'lg:grid-cols-3'}`}>

          {/* Left — Birth form (slides away to widen the predictions area) */}
          <AnimatePresence initial={false}>
          {!sidebarHidden && (
          <motion.div
            key="sidebar"
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-4 sm:p-6 relative overflow-hidden"
            >
              {/* Animated background — vivid color wash + fast particles (skipped in mono) */}
              {theme !== 'mono' && (
              <div className="absolute inset-0 pointer-events-none z-0 form-bg-particles">
                {/* Fast shifting multi-color gradient */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: isLight
                      ? 'linear-gradient(135deg, rgba(var(--c-accent-rgb),0.05), rgba(255,230,0,0.03), rgba(0,180,90,0.03), rgba(255,140,0,0.04), rgba(0,160,220,0.03))'
                      : 'linear-gradient(135deg, rgba(var(--c-accent-rgb),0.08), rgba(255,230,0,0.04), rgba(0,255,135,0.04), rgba(255,140,0,0.05), rgba(0,220,255,0.04))',
                    backgroundSize: '500% 500%',
                  }}
                  animate={{ backgroundPosition: ['0% 0%', '100% 30%', '60% 100%', '30% 60%', '0% 0%'] }}
                  transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                />
                {/* Drifting color blobs — slow and calm so the form stays readable */}
                <motion.div
                  className="absolute w-32 h-32 rounded-full blur-[50px]"
                  style={{ background: isLight ? 'rgba(var(--c-accent-rgb),0.08)' : 'rgba(var(--c-accent-rgb),0.12)' }}
                  animate={{ x: ['-20%', '120%'], y: ['10%', '70%'] }}
                  transition={{ duration: 14, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute w-28 h-28 rounded-full blur-[45px]"
                  style={{ background: isLight ? 'rgba(0,180,90,0.06)' : 'rgba(0,255,135,0.08)' }}
                  animate={{ x: ['110%', '-10%'], y: ['60%', '20%'] }}
                  transition={{ duration: 18, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                />
                {/* Gently floating particles */}
                {[
                  { x: '5%',  y: '20%', s: 3,   c: '#FF2E51', dur: 8,  dx: 18,  dy: -14 },
                  { x: '80%', y: '10%', s: 2.5, c: '#FFE600', dur: 10, dx: -15, dy: 10  },
                  { x: '60%', y: '75%', s: 3,   c: '#00FF87', dur: 9,  dx: 14,  dy: -16 },
                  { x: '20%', y: '85%', s: 2.5, c: '#FF8C00', dur: 11, dx: -12, dy: -14 },
                  { x: '45%', y: '40%', s: 2,   c: '#00D2FF', dur: 12, dx: 16,  dy: 8   },
                  { x: '90%', y: '50%', s: 2.5, c: '#FF2E51', dur: 9,  dx: -18, dy: -8  },
                  { x: '35%', y: '90%', s: 2.5, c: '#B43CFF', dur: 10, dx: 12,  dy: -18 },
                  { x: '70%', y: '15%', s: 3,   c: '#00FF87', dur: 11, dx: -14, dy: 16  },
                ].map((p, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      left: p.x, top: p.y,
                      width: p.s, height: p.s,
                      backgroundColor: p.c,
                      boxShadow: `0 0 ${p.s * 4}px ${p.c}55`,
                    }}
                    animate={{
                      x: [0, p.dx, -p.dx * 0.6, p.dx * 0.3, 0],
                      y: [0, p.dy, -p.dy * 0.5, p.dy * 0.7, 0],
                      opacity: isLight ? [0.15, 0.35, 0.2, 0.3, 0.15] : [0.35, 0.65, 0.45, 0.6, 0.35],
                      scale: [1, 1.25, 0.95, 1.1, 1],
                    }}
                    transition={{ duration: p.dur, delay: i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                ))}
              </div>
              )}

              <div className="relative z-10">
                <div className={`flex items-center gap-2.5 mb-6 pb-4 border-b ${isLight ? 'border-gray-150' : 'border-white/5'}`}
                  style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : undefined }}
                >
                  <motion.div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}
                    animate={{ boxShadow: ['0 0 0px rgba(var(--c-accent-rgb),0)', '0 0 12px rgba(var(--c-accent-rgb),0.25)', '0 0 0px rgba(var(--c-accent-rgb),0)'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Moon className="w-4 h-4" style={{ color: ACCENT }} />
                  </motion.div>
                  <h2 className={`text-sm font-semibold tracking-wide ${isLight ? 'text-gray-800' : 'text-white'}`}>
                    {t('form.birthDetails')}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setSidebarHidden(true)}
                    title={t('form.hidePanel')}
                    aria-label={t('form.hidePanel')}
                    className="btn-cta btn-cta-blink ml-auto w-9 h-9 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center transition-all duration-200"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
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
          </motion.div>
          )}
          </AnimatePresence>

          {/* Right — Results */}
          <div className={sidebarHidden ? '' : 'lg:col-span-2'}>
            {sidebarHidden && (
              <button
                type="button"
                onClick={() => setSidebarHidden(false)}
                className={`mb-4 inline-flex items-center gap-1.5 text-xs font-semibold px-3 h-9 rounded-xl border transition-colors ${
                  isLight ? 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200' : 'bg-white/5 border-white/8 text-white/60 hover:bg-white/10'
                }`}
              >
                <PanelLeftOpen className="w-4 h-4" /> {t('form.showPanel')}
              </button>
            )}
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
                    <TabBtn id="doshas"   label={t('tab.doshas')}   icon={ShieldAlert} />
                    <TabBtn id="graph"    label={t('tab.graph')}    icon={Share2}     />
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
                            className={`relative px-5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                              chartStyle === style
                                ? 'text-white on-accent'
                                : isLight
                                  ? 'bg-gray-100 text-gray-500 hover:text-gray-800 border border-gray-200'
                                  : 'bg-white/4 text-white/40 hover:text-white border border-white/8'
                            }`}
                          >
                            {chartStyle === style && (
                              <motion.span
                                layoutId="chart-style-pill"
                                className="absolute inset-0 rounded-lg shadow-sm"
                                style={{ backgroundColor: ACCENT }}
                                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                              />
                            )}
                            <span className="relative z-10">
                              {style === 'south' ? t('chart.southIndian') : t('chart.northIndian')}
                            </span>
                          </button>
                        ))}
                      </div>

                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        {chartStyle === 'south'
                          ? <SouthIndianChart
                              planets={chartData.planets}
                              ascendantRashi={chartData.ascendant.rashiIndex}
                              currentDasha={chartData.currentDasha}
                              mahadashaTimeline={chartData.mahadashaTimeline}
                              birthDate={chartData.birthData.date}
                            />
                          : <NorthIndianChart
                              planets={chartData.planets}
                              ascendantRashi={chartData.ascendant.rashiIndex}
                              currentDasha={chartData.currentDasha}
                              mahadashaTimeline={chartData.mahadashaTimeline}
                              birthDate={chartData.birthData.date}
                            />
                        }
                      </div>

                      <NakshatraInfo nakshatra={chartData.moonNakshatra} />

                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <Sun className="w-4 h-4" style={{ color: 'var(--c-accent)' }} />
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
                            style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}
                          >
                            <Stars className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
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

                  {/* ── Doshas (Mangal, Kaal Sarpa, Pitra, Sade Sati) ─ */}
                  {activeTab === 'doshas' && birthData && (
                    <motion.div key="doshas" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <DoshaTab birthData={birthData} />
                    </motion.div>
                  )}

                  {/* ── Knowledge Graph (entities critical for now) ─ */}
                  {activeTab === 'graph' && birthData && (
                    <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <KnowledgeGraph birthData={birthData} />
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
                      background: isLight
                        ? 'linear-gradient(135deg, rgba(var(--c-accent-rgb),0.05), rgba(255,230,0,0.02), rgba(0,255,135,0.02), rgba(255,140,0,0.03))'
                        : 'linear-gradient(135deg, rgba(var(--c-accent-rgb),0.12), rgba(255,230,0,0.06), rgba(0,255,135,0.06), rgba(255,140,0,0.08))',
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
                        { symbol: '☉', color: '#f59e0b', labelKey: 'planet.sun' as const },
                        { symbol: '☽', color: '#94a3b8', labelKey: 'planet.moon' as const },
                        { symbol: '♂', color: '#ef4444', labelKey: 'planet.mars' as const },
                        { symbol: '♃', color: '#eab308', labelKey: 'planet.jupiter' as const },
                        { symbol: '♀', color: '#f472b6', labelKey: 'planet.venus' as const },
                        { symbol: '♄', color: '#38bdf8', labelKey: 'planet.saturn' as const },
                      ].map((p, i) => (
                        <motion.div
                          key={p.labelKey}
                          className="flex flex-col items-center gap-1"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 2.5 + i * 0.3, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <span className="text-2xl" style={{ color: p.color, textShadow: `0 0 12px ${p.color}44` }}>{p.symbol}</span>
                          <span className={`text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-white/25'}`}>{t(p.labelKey)}</span>
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
        {/* Links to the static guide pages.
            These are the only crawl path into them from the app: the rest of this
            page is rendered into #root after the bundle loads, so a crawler that
            does not execute JS sees nothing to follow. They are also the internal
            links that let those pages accumulate any authority the domain has. */}
        <nav
          aria-label={t('footer.guidesLabel')}
          className={`max-w-7xl mx-auto px-3 sm:px-5 pb-3 mb-3 border-b flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] sm:text-[11px] ${
            isLight ? 'border-slate-200 text-slate-500' : 'border-white/4 text-white/35'
          }`}
        >
          <span className={`font-mono uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/20'}`}>
            {t('footer.guidesLabel')}
          </span>
          <a href="/birth-chart-reading" className="hover:underline">{t('footer.linkBirthChart')}</a>
          <a href="/horoscope" className="hover:underline">{t('footer.linkHoroscope')}</a>
          <a href="/future-forecast" className="hover:underline">{t('footer.linkForecast')}</a>
          <a href="/kundli-matching" className="hover:underline">{t('footer.linkMatching')}</a>
          <a href="/vedic-astrology-india" className="hover:underline">{t('footer.linkIndia')}</a>
          <a href="/vedic-astrology-europe" className="hover:underline">{t('footer.linkEurope')}</a>
        </nav>
        <div className={`max-w-7xl mx-auto px-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-0 text-[9px] sm:text-[10px] font-mono ${
          isLight ? 'text-slate-500' : 'text-white/18'
        }`}>
          <span>trytellme.xyz · {t('footer.tagline')}</span>
          <span>{t('footer.nonCommercial')}</span>
          <span>{t('footer.algorithms')}</span>
        </div>
      </footer>
    </div>
    </MotionConfig>
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
