import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { sectionTransition } from './components/shared/motion';
import { Moon, Sun, Aperture, DraftingCompass, Radio, Check, ChevronDown, LayoutGrid, List, Stars, Zap, AlertCircle, Compass, Heart, Layers, Share2, CalendarRange, Orbit, Download, MessageCircle, ShieldAlert, PanelLeftClose, PanelLeftOpen, Languages } from 'lucide-react';

const ACCENT = 'var(--c-accent)';

function SectionPane({ tab, children }: { tab: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -14 }}
        transition={sectionTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

import { BirthDataForm } from './components/Forms/BirthDataForm';
import { SouthIndianChart } from './components/Chart/SouthIndianChart';
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
import { LifeOutlookTab } from './components/Graph/LifeOutlookTab';
import TransitImpactTab from './components/Transits/TransitImpactTab';
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
import { useGenerateWesternChart } from './hooks/useWesternChart';
import { WesternChartWheel } from './components/Western/WesternChartWheel';
import { WesternPlanetTable } from './components/Western/WesternPlanetTable';
import { WesternAspectGrid } from './components/Western/WesternAspectGrid';
import { WesternNatalModal } from './components/Western/WesternNatalModal';
import { WesternTransitsTab } from './components/Western/WesternTransitsTab';
import { WesternPatternsTab } from './components/Western/WesternPatternsTab';
import { WesternMatchTab } from './components/Western/WesternMatchTab';
import { buildWesternNatalReport } from './lib/core/western/natal';
import { downloadWesternChartMarkdown } from './lib/core/western/exportWesternChart';
import { LanguageProvider, useLang } from './i18n/LanguageContext';
import { coreLang, type Lang, type TranslationKey } from './i18n/translations';
import type { BirthData, Chart } from './types/astrology';
import type { WesternChart } from './types/westernAstrology';

/** Header language dropdown entries — short trigger label + native menu name. */
const LANG_OPTIONS: { code: Lang; short: string; native: string; titleKey: TranslationKey }[] = [
  { code: 'en', short: 'EN',  native: 'English', titleKey: 'lang.englishTitle' },
  { code: 'si', short: 'සිං', native: 'සිංහල',   titleKey: 'lang.sinhalaTitle' },
  { code: 'ta', short: 'த',   native: 'தமிழ்',    titleKey: 'lang.tamilTitle' },
  { code: 'zh', short: '中',  native: '中文',     titleKey: 'lang.chineseTitle' },
  { code: 'hi', short: 'हिं',  native: 'हिन्दी',    titleKey: 'lang.hindiTitle' },
  { code: 'ja', short: '日',  native: '日本語',   titleKey: 'lang.japaneseTitle' },
  { code: 'ko', short: '한',  native: '한국어',   titleKey: 'lang.koreanTitle' },
  { code: 'ar', short: 'ع',   native: 'العربية',  titleKey: 'lang.arabicTitle' },
  { code: 'ml', short: 'മ',   native: 'മലയാളം',  titleKey: 'lang.malayalamTitle' },
];

const LEGAL_KEY = 'trytellme_legal_accepted';
const DISCLAIMER_KEY = 'trytellme_disclaimer_accepted';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

type ViewTab = 'chart' | 'yogas' | 'dasha' | 'now' | 'transits' | 'match' | 'insights' | 'vargas' | 'graph' | 'doshas';
type Theme = 'dark' | 'light' | 'mono' | 'azure' | 'terminal';

function birthChip(data: BirthData): string {
  const [ymd, time = ''] = data.date.split('T');
  const hhmm = time.slice(0, 5);
  return hhmm ? `${ymd} · ${hhmm}` : ymd;
}

function isPhoneLayout(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;
}

function SectionTabs({
  tabs,
  active,
  onSelect,
  isLight,
}: {
  tabs: { id: ViewTab; label: string; icon: React.ElementType }[];
  active: ViewTab;
  onSelect: (id: ViewTab) => void;
  isLight: boolean;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const next = {
      left: el.scrollLeft > 8,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 8,
    };
    setEdges(prev => (prev.left === next.left && prev.right === next.right ? prev : next));
  }, []);

  const signature = tabs.map(tab => tab.id).join('|');
  useEffect(() => {
    const el = scrollerRef.current;
    const btn = el?.querySelector<HTMLElement>('[aria-current="page"]');
    btn?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
    updateEdges();
  }, [active, signature, updateEdges]);

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges]);

  return (
    <div id="section-tabs" className="section-tabs relative">
      <div
        ref={scrollerRef}
        onScroll={updateEdges}
        className="tab-bar tab-bar-mobile flex gap-1 rounded-xl p-1 overflow-x-auto"
        role="tablist"
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const selected = active === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-current={selected ? 'page' : undefined}
              onClick={() => onSelect(id)}
              className={`relative flex items-center justify-center gap-1.5 min-h-[40px] sm:min-h-0 py-2 px-2.5 sm:px-3 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wide transition-colors duration-200 whitespace-nowrap shrink-0 sm:flex-1 ${
                selected
                  ? 'text-white on-accent'
                  : isLight
                    ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="active-tab-pill"
                  className="absolute inset-0 rounded-lg shadow-sm"
                  style={{ backgroundColor: ACCENT }}
                  transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                />
              )}
              <Icon className="relative z-10 w-3.5 h-3.5 shrink-0" />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
      {edges.left && <div className="tab-edge tab-edge-left" aria-hidden />}
      {edges.right && <div className="tab-edge tab-edge-right" aria-hidden />}
    </div>
  );
}

function AppContent() {
  const [birthData, setBirthData]   = useState<BirthData | null>(null);
  const [activeTab, setActiveTab]   = useState<ViewTab>('chart');
  const [chartData, setChartData]   = useState<Chart | null>(null);
  const [westernChartData, setWesternChartData] = useState<WesternChart | null>(null);
  const isWestern = birthData?.system === 'WESTERN';
  const [theme, setTheme]           = useState<Theme>(() => {
    const saved = localStorage.getItem('trytellme_theme') ?? localStorage.getItem('predictor_theme');
    return saved === 'mono' ? 'mono' : saved === 'azure' ? 'azure' : saved === 'terminal' ? 'terminal' : saved === 'light' ? 'light' : 'dark';
  });
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  // Ink and Signal ride on the dark layout, so they count as not-light
  // here and in useTheme(). Glass rides on the light layout.
  const isLight = theme !== 'dark' && theme !== 'mono' && theme !== 'terminal';
  // Hide all chat affordances when the NVIDIA key is missing/empty.
  const chatConfigured = isChatConfigured();
  // Legal gate — once per device. Returning visits go straight to the form.
  const [welcomeLegalVisible, setWelcomeLegalVisible] = useState(
    () => localStorage.getItem(LEGAL_KEY) !== 'accepted',
  );
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);
  const [matchExperimentalVisible, setMatchExperimentalVisible] = useState(false);
  const [monthlyTransitsVisible, setMonthlyTransitsVisible] = useState(false);
  const [natalChartVisible, setNatalChartVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);

  // Phones put the form above the chart, so tuck it away once a reading exists.
  useEffect(() => {
    if ((chartData || westernChartData) && isPhoneLayout()) setSidebarHidden(true);
  }, [chartData, westernChartData]);
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
  const generateWesternChart = useGenerateWesternChart();
  const { data: dashaTimeline, isLoading: isDashaLoading } = useDashaTimeline(isWestern ? null : birthData, 80);
  const { isError: isHealthError } = useHealthCheck();
  const { lang, setLang, t } = useLang();


  // Apply theme classes to <html> so body background + tokens respond.
  // Ink and Signal ride on the dark layout. Glass rides on the light layout.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('theme-dark', theme === 'dark' || theme === 'mono' || theme === 'terminal');
    // "azure" rides on top of the light layout.
    root.classList.toggle('theme-light', theme === 'light' || theme === 'azure');
    root.classList.toggle('theme-mono', theme === 'mono');
    root.classList.toggle('theme-azure', theme === 'azure');
    root.classList.toggle('theme-terminal', theme === 'terminal');
    localStorage.setItem('trytellme_theme', theme);
  }, [theme]);

  // A click plays out after the pointer is up. :active ends too fast to see,
  // and the chart houses are divs, so a button rule never reached them.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const press = (event: PointerEvent) => {
      if (reduce.matches) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const el = target.closest('button, a, summary, [role="button"], [role="tab"], [role="menuitem"], [role="menuitemradio"], .tap-row, .tap-cell, .tap-card, .tap-tr');
      if (!(el instanceof HTMLElement)) return;
      if (el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true') return;
      el.classList.remove('press');
      void el.offsetWidth;
      el.classList.add('press');
    };
    const clear = (event: AnimationEvent) => {
      if (event.animationName !== 'press' && event.animationName !== 'press-tint') return;
      const el = event.target;
      if (el instanceof HTMLElement) el.classList.remove('press');
    };
    document.addEventListener('pointerdown', press);
    document.addEventListener('animationend', clear);
    return () => {
      document.removeEventListener('pointerdown', press);
      document.removeEventListener('animationend', clear);
    };
  }, []);

  const themeOptions: { id: Theme; label: string; icon: React.ElementType }[] = [
    { id: 'dark',     label: t('theme.dark'),     icon: Moon },
    { id: 'light',    label: t('theme.light'),    icon: Sun },
    { id: 'azure',    label: t('theme.azure'),    icon: Aperture },
    { id: 'mono',     label: t('theme.mono'),     icon: DraftingCompass },
    { id: 'terminal', label: t('theme.terminal'), icon: Radio },
  ];
  const activeTheme = themeOptions.find(o => o.id === theme) ?? themeOptions[0];

  const runGenerate = async (data: BirthData) => {
    setBirthData(data);
    try {
      if (data.system === 'WESTERN') {
        const result = await generateWesternChart.mutateAsync(data);
        setWesternChartData(result);
        setChartData(null);
        setActiveTab('chart');
        // Every theme gets its own reveal colour (see LagnaIntro). This only
        // checks the OS-level accessibility preference, not the theme.
        const wantsMotion = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (wantsMotion) setLagnaIntroRashi(result.ascendant.signIndex);
        if (isPhoneLayout()) setSidebarHidden(true);
        return;
      }
      const result = await generateChart.mutateAsync(data);
      setChartData(result);
      setWesternChartData(null);
      setActiveTab('chart');
      // Reveal the lagna as particles before the chart is seen. The chart
      // mounts underneath straight away; the overlay simply covers it until the
      // figure has dispersed. Every theme gets its own reveal style (see
      // LagnaIntro), so this only checks for reduced-motion, not the theme.
      const wantsMotion = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (wantsMotion) setLagnaIntroRashi(result.ascendant.rashiIndex);
      if (isPhoneLayout()) setSidebarHidden(true);
    } catch (err) {
      console.error('Failed to generate chart:', err);
    }
  };

  const handleSubmit = (data: BirthData) => {
    // The notice says it will not appear again on this device. Honour that,
    // and don't make the chart wait on it.
    if (localStorage.getItem(DISCLAIMER_KEY) === 'accepted') {
      runGenerate(data);
      return;
    }
    setPendingBirthData(data);
    setDisclaimerVisible(true);
  };

  const handleDisclaimerAccept = () => {
    localStorage.setItem(DISCLAIMER_KEY, 'accepted');
    setDisclaimerVisible(false);
    const data = pendingBirthData;
    setPendingBirthData(null);
    if (data) runGenerate(data);
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
    // A long reading scrolls the section away. Bring the new section back
    // under the header instead of leaving the user at the bottom of the last one.
    const bar = document.getElementById('section-tabs');
    if (!bar) return;
    const stickyTop = parseFloat(getComputedStyle(bar).top) || 0;
    if (bar.getBoundingClientRect().top <= stickyTop + 1) {
      bar.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  return (
    <MotionConfig
      reducedMotion="user"
    >
    <div className={`min-h-screen tech-grid transition-colors duration-300 ${isLight ? 'theme-light' : ''}`}
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Legal gate — first visit on this device. Accepting it surfaces the
          "your data stays on your device" banner. */}
      <WelcomeLegalModal
        visible={welcomeLegalVisible}
        onAccept={() => {
          localStorage.setItem(LEGAL_KEY, 'accepted');
          setWelcomeLegalVisible(false);
          setPrivacyTrigger('load');
          setPrivacyVisible(true);
        }}
      />

      {/* Disclaimer — shown on every Generate Chart press */}
      <DisclaimerModal visible={disclaimerVisible} onAccept={handleDisclaimerAccept} />

      {/* Lagna particle reveal — plays over the freshly mounted chart */}
      <LagnaIntro rashiIndex={lagnaIntroRashi} onDone={() => setLagnaIntroRashi(null)} theme={theme} />

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
      {isWestern ? (
        <WesternNatalModal
          visible={natalChartVisible}
          onClose={() => setNatalChartVisible(false)}
          birthData={birthData}
        />
      ) : (
        <NatalChartModal
          visible={natalChartVisible}
          onClose={() => setNatalChartVisible(false)}
          birthData={birthData}
        />
      )}

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

      {/* High-tech particle network — dark & light themes only (mono/terminal are static) */}
      {theme !== 'mono' && theme !== 'terminal' && <ParticleField isLight={isLight} />}

      {theme !== 'mono' && theme !== 'terminal' && (
        <div className="page-wash" aria-hidden />
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

            {/* Natal chart — only once there is a chart to read */}
            {(chartData || westernChartData) && (
            <button
              onClick={() => setNatalChartVisible(true)}
              title={t('natal.title')}
              className="chrome-btn flex items-center gap-1.5 text-xs px-2.5 sm:px-3 h-8 sm:h-9 rounded-xl font-semibold"
            >
              <Orbit className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{t('header.natalChart')}</span>
            </button>
            )}

            {/* Export — download the full chart as Markdown (needs a chart) */}
            {(chartData || westernChartData) && (
              <button
                onClick={() => {
                  if (westernChartData) {
                    downloadWesternChartMarkdown(westernChartData, buildWesternNatalReport(westernChartData, coreLang(lang)), coreLang(lang));
                  } else if (chartData) {
                    downloadChartMarkdown(chartData);
                  }
                }}
                title={t('header.exportTitle')}
                className="btn-cta btn-cta-blink flex items-center gap-1.5 text-xs px-3 h-9 rounded-xl font-bold transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t('header.export')}</span>
              </button>
            )}

            {/* Monthly transits — Vedic-only (dasha/gochara sign-change timing); no Western equivalent in this pass */}
            {chartData && (
              <button
                onClick={() => setMonthlyTransitsVisible(true)}
                title={t('monthly.title')}
                className="chrome-btn flex items-center gap-1.5 text-xs px-2.5 sm:px-3 h-8 sm:h-9 rounded-xl font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--c-accent)' }} />
                <CalendarRange className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{t('header.monthlyTransits')}</span>
              </button>
            )}

            {/* Language dropdown: English / Sinhala / Tamil / Chinese / Hindi / Japanese / Korean / Arabic / Malayalam */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(o => !o)}
                title={t(LANG_OPTIONS.find(o => o.code === lang)!.titleKey)}
                aria-haspopup="menu"
                aria-expanded={langMenuOpen}
                className="chrome-btn h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center gap-1 text-[11px] sm:text-xs font-bold"
              >
                <Languages className="w-4 h-4 shrink-0" />
                <span>{LANG_OPTIONS.find(o => o.code === lang)!.short}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
              {langMenuOpen && (
                <>
                  {/* click-away catcher */}
                  <div className="fixed inset-0 z-40" onClick={() => setLangMenuOpen(false)} aria-hidden />
                  <motion.div
                    role="menu"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    className="chrome-menu absolute right-0 mt-2 w-44 z-50 origin-top-right rounded-xl p-1"
                  >
                    {LANG_OPTIONS.map(({ code, native }) => {
                      const selected = code === lang;
                      return (
                        <button
                          key={code}
                          role="menuitemradio"
                          aria-checked={selected}
                          onClick={() => { setLang(code); setLangMenuOpen(false); }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 ${
                            selected
                              ? isLight ? 'bg-gray-100 text-gray-900' : 'bg-white/10 text-white'
                              : isLight ? 'text-gray-600 hover:bg-gray-50' : 'text-white/60 hover:bg-white/5'
                          }`}
                        >
                          <span className="flex-1 text-left">{native}</span>
                          {selected && <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--c-accent)' }} />}
                        </button>
                      );
                    })}
                  </motion.div>
                </>
              )}
              </AnimatePresence>
            </div>

            {/* Theme picker — Dark / Light / Black & White */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(o => !o)}
                title={t('header.theme')}
                aria-haspopup="menu"
                aria-expanded={themeMenuOpen}
                className="chrome-btn h-8 sm:h-9 px-2 sm:px-2.5 rounded-xl flex items-center gap-1"
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
                    className="chrome-menu absolute right-0 mt-2 w-44 z-50 origin-top-right rounded-xl p-1"
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
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className={`app-split ${sidebarHidden ? '' : 'is-open'}`}>

          {/* Left — Birth form. The column width (desktop) or height (narrow) eases open and shut. */}
          <div
            className="birth-rail"
            aria-hidden={sidebarHidden}
            ref={node => {
              if (!node) return;
              if (sidebarHidden) node.setAttribute('inert', '');
              else node.removeAttribute('inert');
            }}
          >
            <div className="birth-rail-clip">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-2xl p-3 sm:p-4 relative overflow-hidden"
            >
              {theme !== 'mono' && theme !== 'terminal' && (
                <div className="form-wash" aria-hidden />
              )}

              <div className="relative z-10">
                <div className={`flex items-center gap-2 mb-3 pb-2.5 border-b ${isLight ? 'border-gray-150' : 'border-white/5'}`}
                  style={{ borderColor: isLight ? 'rgba(0,0,0,0.08)' : undefined }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}
                  >
                    <Moon className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                  </div>
                  <h2 className={`text-[13px] font-semibold tracking-wide ${isLight ? 'text-gray-800' : 'text-white'}`}>
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

                <BirthDataForm onSubmit={handleSubmit} isLoading={generateChart.isPending || generateWesternChart.isPending} />

                {(generateChart.isError || generateWesternChart.isError) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-3 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {generateChart.error?.message || generateWesternChart.error?.message || t('form.error')}
                  </motion.div>
                )}
              </div>
            </motion.div>
            </div>
          </div>

          {/* Right — Results */}
          <div className="min-w-0">
            {sidebarHidden && (
              <button
                type="button"
                onClick={() => setSidebarHidden(false)}
                className="chrome-btn mb-3 w-full lg:w-auto inline-flex items-center gap-2 text-xs font-semibold px-3 min-h-11 lg:min-h-9 lg:h-9 rounded-xl"
              >
                <PanelLeftOpen className="w-4 h-4 shrink-0" />
                <span className="truncate text-left">
                  {birthData ? birthChip(birthData) : t('form.showPanel')}
                </span>
                {birthData && (
                  <span className={`ml-auto lg:ml-1 font-bold ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                    {t('form.showPanel')}
                  </span>
                )}
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
                  <SectionTabs
                    isLight={isLight}
                    active={activeTab}
                    onSelect={handleTabClick}
                    tabs={[
                      { id: 'chart', label: t('tab.chart'), icon: LayoutGrid },
                      { id: 'dasha', label: t('tab.timeline'), icon: List },
                      { id: 'now', label: t('tab.now'), icon: Compass },
                      { id: 'transits', label: t('tab.transits'), icon: Orbit },
                      { id: 'match', label: t('tab.match'), icon: Heart },
                      { id: 'yogas', label: t('tab.patterns'), icon: Stars },
                      { id: 'vargas', label: t('tab.vargas'), icon: Layers },
                      { id: 'doshas', label: t('tab.doshas'), icon: ShieldAlert },
                      { id: 'graph', label: t('tab.graph'), icon: Share2 },
                      { id: 'insights', label: t('tab.insights'), icon: Zap },
                    ]}
                  />

                  <SectionPane tab={activeTab}>
                  {/* ── Chart ─────────────────────────────────────── */}
                  {activeTab === 'chart' && (
                    <motion.div key="chart"  className="space-y-4">
                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        <SouthIndianChart
                          planets={chartData.planets}
                          ascendantRashi={chartData.ascendant.rashiIndex}
                          currentDasha={chartData.currentDasha}
                          mahadashaTimeline={chartData.mahadashaTimeline}
                          birthDate={chartData.birthData.date}
                        />
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
                    <motion.div key="dasha"  className="space-y-4">
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
                    <motion.div key="now" >
                      <CurrentPeriodTab birthData={birthData} />
                    </motion.div>
                  )}

                  {/* ── Transits (major sign changes and their impact) ── */}
                  {activeTab === 'transits' && birthData && (
                    <motion.div key="transits" >
                      <TransitImpactTab birthData={birthData} />
                    </motion.div>
                  )}

                  {/* ── Match (Horoscope compatibility) ──────────── */}
                  {activeTab === 'match' && birthData && (
                    <motion.div key="match" >
                      <MatchTab person={birthData} />
                    </motion.div>
                  )}

                  {/* ── Patterns (Yogas) ──────────────────────────── */}
                  {activeTab === 'yogas' && birthData && (
                    <motion.div key="yogas" >
                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        <div className="flex items-start gap-2.5 mb-5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}
                          >
                            <Stars className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
                          </div>
                          <div className="min-w-0 pt-0.5">
                            <h3 className={`text-sm font-semibold leading-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
                              {t('patterns.title')}
                            </h3>
                            <p className={`text-xs mt-1 leading-relaxed ${isLight ? 'text-slate-500' : 'text-white/45'}`}>
                              {t('patterns.subtitle')}
                            </p>
                          </div>
                        </div>
                        <YogasDisplay birthData={birthData} />
                      </div>
                    </motion.div>
                  )}

                  {/* ── Vargas (divisional charts D9/D10) ─────────── */}
                  {activeTab === 'vargas' && birthData && (
                    <motion.div key="vargas" >
                      <VargaTab birthData={birthData} />
                    </motion.div>
                  )}

                  {/* ── Doshas (Mangal, Kaal Sarpa, Pitra, Sade Sati) ─ */}
                  {activeTab === 'doshas' && birthData && (
                    <motion.div key="doshas" >
                      <DoshaTab birthData={birthData} />
                    </motion.div>
                  )}

                  {/* ── Graph: life in chapters + the year ahead ── */}
                  {activeTab === 'graph' && birthData && (
                    <motion.div key="graph" >
                      <LifeOutlookTab birthData={birthData} />
                    </motion.div>
                  )}

                  {/* ── Insights ──────────────────────────────────── */}
                  {activeTab === 'insights' && birthData && (
                    <motion.div key="insights" >
                      <DeepInsights birthData={birthData} />
                    </motion.div>
                  )}
                  </SectionPane>
                </motion.div>
              ) : westernChartData ? (
                <motion.div
                  key="western-results"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <SectionTabs
                    isLight={isLight}
                    active={activeTab}
                    onSelect={handleTabClick}
                    tabs={[
                      { id: 'chart', label: t('tab.chart'), icon: LayoutGrid },
                      { id: 'now', label: t('tab.now'), icon: Compass },
                      { id: 'match', label: t('tab.match'), icon: Heart },
                      { id: 'yogas', label: t('tab.patterns'), icon: Stars },
                    ]}
                  />

                  <SectionPane tab={`western-${activeTab}`}>
                  {/* ── Chart ─────────────────────────────────────── */}
                  {activeTab === 'chart' && (
                    <motion.div key="western-chart"  className="space-y-4">
                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                          <Sun className="w-4 h-4" style={{ color: 'var(--c-accent)' }} />
                          {t('western.chart.wheelTitle')}
                        </h3>
                        <WesternChartWheel chart={westernChartData} />
                      </div>

                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <Sun className="w-4 h-4" style={{ color: 'var(--c-accent)' }} />
                          {t('chart.planetaryPositions')}
                        </h3>
                        <WesternPlanetTable
                          planets={westernChartData.planets}
                          ascendant={westernChartData.ascendant}
                          midheaven={westernChartData.midheaven}
                        />
                      </div>

                      <div className="glass-card rounded-2xl p-3 sm:p-6">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                          <Stars className="w-4 h-4" style={{ color: 'var(--c-accent)' }} />
                          {t('western.chart.aspectGridTitle')}
                        </h3>
                        <WesternAspectGrid aspects={westernChartData.aspects} />
                      </div>
                    </motion.div>
                  )}

                  {/* ── Now (transits to natal) ───────────────────── */}
                  {activeTab === 'now' && birthData && (
                    <motion.div key="western-now" >
                      <WesternTransitsTab birthData={birthData} />
                    </motion.div>
                  )}

                  {/* ── Match (Synastry) ──────────────────────────── */}
                  {activeTab === 'match' && birthData && (
                    <motion.div key="western-match" >
                      <WesternMatchTab person={birthData} />
                    </motion.div>
                  )}

                  {/* ── Patterns (aspect patterns) ────────────────── */}
                  {activeTab === 'yogas' && (
                    <motion.div key="western-yogas" >
                      <WesternPatternsTab chart={westernChartData} />
                    </motion.div>
                  )}
                  </SectionPane>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 sm:p-16 text-center relative overflow-hidden"
                >
                  <div className="form-wash" aria-hidden />
                  <div className="relative z-10">
                    <h3 className="text-2xl font-display font-bold text-white mb-3">
                      {t('empty.title')}
                    </h3>
                    <p className={`max-w-sm mx-auto text-sm leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/50'}`}>
                      {t('empty.body')}
                    </p>
                    <ol className="flex flex-wrap items-center justify-center gap-2 mt-5">
                      {[t('form.birthDate'), t('form.birthPlace'), t('form.generate')].map((label, i) => (
                        <li
                          key={label}
                          className="empty-step inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                          style={{
                            background: 'rgba(var(--c-accent-rgb),0.10)',
                            color: 'var(--c-accent)',
                            animationDelay: `${i * 90}ms`,
                          }}
                        >
                          <span className="font-mono">{i + 1}</span>
                          {label}
                        </li>
                      ))}
                    </ol>
                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 mt-6 sm:mt-8">
                      {[
                        { symbol: '☉', color: '#f59e0b', labelKey: 'planet.sun' as const },
                        { symbol: '☽', color: '#94a3b8', labelKey: 'planet.moon' as const },
                        { symbol: '♂', color: '#ef4444', labelKey: 'planet.mars' as const },
                        { symbol: '♃', color: '#eab308', labelKey: 'planet.jupiter' as const },
                        { symbol: '♀', color: '#f472b6', labelKey: 'planet.venus' as const },
                        { symbol: '♄', color: '#38bdf8', labelKey: 'planet.saturn' as const },
                      ].map((p, i) => (
                        <div key={p.labelKey} className="flex flex-col items-center gap-1">
                          <span
                            className="empty-planet text-2xl"
                            style={{ color: p.color, animationDelay: `${i * 0.35}s`, animationDuration: `${4.2 + (i % 3) * 0.7}s` }}
                          >{p.symbol}</span>
                          <span className={`text-[9px] font-mono ${isLight ? 'text-slate-400' : 'text-white/25'}`}>{t(p.labelKey)}</span>
                        </div>
                      ))}
                    </div>
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
          className={`max-w-7xl mx-auto px-3 sm:px-5 pb-3 mb-3 border-b space-y-2 text-[10px] sm:text-[11px] ${
            isLight ? 'border-slate-200 text-slate-500' : 'border-white/4 text-white/35'
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className={`font-mono uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/20'}`}>
              {t('footer.predictionsLabel')}
            </span>
            <a href="/future-prediction" className="hover:underline">{t('footer.linkFuturePrediction')}</a>
            <a href="/career-prediction" className="hover:underline">{t('footer.linkCareer')}</a>
            <a href="/marriage-prediction" className="hover:underline">{t('footer.linkMarriage')}</a>
            <a href="/love-prediction" className="hover:underline">{t('footer.linkLove')}</a>
            <a href="/kundli-analysis" className="hover:underline">{t('footer.linkKundli')}</a>
            <a href="/astrology-2027" className="hover:underline">{t('footer.link2027')}</a>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className={`font-mono uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-white/20'}`}>
              {t('footer.guidesLabel')}
            </span>
            <a href="/birth-chart" className="hover:underline">{t('footer.linkBirthChartCalc')}</a>
            <a href="/birth-chart-reading" className="hover:underline">{t('footer.linkBirthChart')}</a>
            <a href="/personalized-horoscope" className="hover:underline">{t('footer.linkPersonalized')}</a>
            <a href="/horoscope" className="hover:underline">{t('footer.linkHoroscope')}</a>
            <a href="/kundli-matching" className="hover:underline">{t('footer.linkMatching')}</a>
            <a href="/ai-astrology" className="hover:underline">{t('footer.linkAi')}</a>
            <a href="/vedic-astrology-india" className="hover:underline">{t('footer.linkIndia')}</a>
            <a href="/vedic-astrology-europe" className="hover:underline">{t('footer.linkEurope')}</a>
          </div>
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
