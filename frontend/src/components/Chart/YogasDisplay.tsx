import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Sparkles, Star, TrendingUp, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { getYogas } from '../../services/api';
import type { BirthData, YogaResult } from '../../services/api';
import { BAR_PALETTE, ProgressBar } from '../shared/BarCharts';
import { useLang } from '../../i18n/LanguageContext';
import { labelYogaCategory, labelYogaStrength } from '../../i18n/astroLabels';

interface Props {
  birthData: BirthData;
}

const CATEGORY_STYLE = {
  rajayoga:    { color:'text-violet-300',   bg:'bg-violet-400/8',   border:'border-violet-400/20',   icon:Star },
  mahapurusha: { color:'text-violet-400',  bg:'bg-violet-500/8',  border:'border-violet-500/20',  icon:Sparkles },
  dhana:       { color:'text-emerald-400', bg:'bg-emerald-500/8', border:'border-emerald-500/20', icon:TrendingUp },
  spiritual:   { color:'text-purple-400',  bg:'bg-purple-500/8',  border:'border-purple-500/20',  icon:Sparkles },
  special:     { color:'text-violet-400',  bg:'bg-violet-500/8',  border:'border-violet-500/20',  icon:Shield },
  daridra:     { color:'text-rose-400',    bg:'bg-rose-500/8',    border:'border-rose-500/20',    icon:AlertTriangle },
};

const STRENGTH_CONFIG = {
  'very strong': { color:'text-violet-200',  dot:'bg-violet-300',   bar:4 },
  'strong':      { color:'text-green-400',  dot:'bg-green-400',   bar:3 },
  'medium':      { color:'text-violet-400', dot:'bg-violet-400',  bar:2 },
  'weak':        { color:'text-white/30',   dot:'bg-white/20',    bar:1 },
};

const PLANET_ABBR: Record<string, string> = {
  SUN:'Su', MOON:'Mo', MARS:'Ma', MERCURY:'Me', JUPITER:'Ju',
  VENUS:'Ve', SATURN:'Sa', RAHU:'Ra', KETU:'Ke',
};

interface YogaCardProps {
  yoga: YogaResult;
  index: number;
  lang: ReturnType<typeof useLang>['lang'];
}

const YogaCard: React.FC<YogaCardProps> = ({ yoga, index, lang }) => {
  const [expanded, setExpanded] = useState(false);
  const catStyle = CATEGORY_STYLE[yoga.category] ?? CATEGORY_STYLE.special;
  const strCfg = STRENGTH_CONFIG[yoga.strength] ?? STRENGTH_CONFIG.medium;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`rounded-xl border ${catStyle.border} ${catStyle.bg} overflow-hidden`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-start justify-between text-left hover:brightness-110 transition-all"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Strength dots */}
          <div className="flex flex-col gap-0.5 mt-1.5 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < strCfg.bar ? strCfg.dot : 'bg-white/8'}`} />
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-white text-sm">{yoga.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${catStyle.bg} ${catStyle.color} border ${catStyle.border}`}>
                {labelYogaStrength(yoga.strength, lang)}
              </span>
            </div>

            {/* Planets involved */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {yoga.planetsInvolved.map(p => (
                <span
                  key={p}
                  className={`inline-flex items-center px-2 py-0.5 bg-white/5 rounded-full text-xs border border-white/8 ${catStyle.color}`}
                >
                  {PLANET_ABBR[p] ?? p.slice(0, 2)}
                </span>
              ))}
              {yoga.housesInvolved.filter(h => h > 0).map(h => (
                <span key={`h${h}`} className="inline-flex items-center px-2 py-0.5 bg-white/4 rounded-full text-[10px] text-white/25 border border-white/6">
                  H{h}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="ml-3 shrink-0">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-white/25" />
            : <ChevronDown className="w-4 h-4 text-white/25" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="border-t border-white/6"
          >
            <div className="p-4 bg-black/20">
              <p className="text-sm text-white/60 leading-relaxed">{yoga.effects}</p>
              <div className="mt-3 flex items-center gap-2">
                <ProgressBar
                  pct={yoga.strengthScore * 10}
                  color={BAR_PALETTE.gold}
                  height="md"
                  index={index}
                  className="flex-1"
                />
                <span className={`text-xs font-mono shrink-0 ${strCfg.color}`}>{yoga.strengthScore}/10</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const YogasDisplay: React.FC<Props> = ({ birthData }) => {
  const { lang, t } = useLang();
  const { data: yogas, isLoading, error } = useQuery({
    queryKey: ['yogas', birthData],
    queryFn: () => getYogas(birthData),
    enabled: !!birthData.date,
    staleTime: 30 * 60 * 1000,
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-5 h-5 animate-spin text-violet-500 mr-2" />
        <span className="text-white/30 font-mono text-sm">{t('yogas.loading')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/8 border border-red-500/20 rounded-xl text-red-400 text-sm">
        {t('yogas.failed')}
      </div>
    );
  }

  if (!yogas || yogas.length === 0) {
    return (
      <div className="p-8 text-center text-white/20">
        <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
        <p className="text-sm">{t('yogas.emptyTitle')}</p>
        <p className="text-xs mt-1 opacity-60">{t('yogas.emptyHint')}</p>
      </div>
    );
  }

  const categories = Array.from(new Set(yogas.map(y => y.category)));
  const filtered = activeCategory === 'all' ? yogas : yogas.filter(y => y.category === activeCategory);
  const totalScore = yogas.reduce((s, y) => s + y.strengthScore, 0);
  const avgScore = totalScore / yogas.length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/3 border border-white/6 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{yogas.length}</div>
          <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">{t('yogas.summaryDetected')}</div>
        </div>
        <div className="bg-white/3 border border-white/6 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-violet-300">{yogas.filter(y => y.strength === 'very strong' || y.strength === 'strong').length}</div>
          <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">{t('yogas.summaryStrong')}</div>
        </div>
        <div className="bg-white/3 border border-white/6 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-violet-400">{avgScore.toFixed(1)}</div>
          <div className="text-[10px] text-white/30 mt-1 uppercase tracking-wider">{t('yogas.summaryAvgScore')}</div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-violet-500 text-black'
              : 'bg-white/4 text-white/40 hover:text-white border border-white/8'
          }`}
        >
          {t('yogas.filterAll')} ({yogas.length})
        </button>
        {categories.map(cat => {
          const style = CATEGORY_STYLE[cat as keyof typeof CATEGORY_STYLE] ?? CATEGORY_STYLE.special;
          const catLabel = labelYogaCategory(cat, lang).label;
          const count = yogas.filter(y => y.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                activeCategory === cat
                  ? `${style.bg} ${style.color} ${style.border}`
                  : 'bg-white/4 text-white/40 hover:text-white border-white/8'
              }`}
            >
              {catLabel} ({count})
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="space-y-2.5">
        {filtered.map((yoga, idx) => (
          <YogaCard key={`${yoga.name}-${idx}`} yoga={yoga} index={idx} lang={lang} />
        ))}
      </div>
    </div>
  );
};
