/**
 * TransitDetailPanel — a plain-language, "ordinary people" reading of a single
 * transiting planet, shown in the same right-side slide-in panel pattern the
 * birth-chart uses (PlanetDetailPanel). Explains what the planet is, where it
 * is now, whether it helps or challenges, its condition, and what it is
 * stirring in the person's natal chart — all from the calculated transit data.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { GocharaSnapshot, PlanetTransit } from '../../services/api';
import { computeTransitNatal } from '../../lib/core/transitAnalysis';
import { gocharaEffect } from '../../lib/core/gocharaPhala';
import { type Bi, pick, ordinalNum } from '../../lib/core/i18n';
import { TR, TR_FALLBACK } from '../../lib/core/text/transitReadingText';
import { PLANET_SYMBOLS, PLANET_COLORS, RASHIS } from '../../types/astrology';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import {
  labelPlanet, labelPlanetTheme, labelRashi, labelHouseTheme,
} from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

type Tone = 'good' | 'bad' | 'neutral';
const toneColor = (tone: Tone) => (tone === 'good' ? '#10b981' : tone === 'bad' ? '#f43f5e' : '#94a3b8');

interface Props {
  transit: PlanetTransit | null;
  gochara: GocharaSnapshot;
  onClose: () => void;
}

export const TransitDetailPanel: React.FC<Props> = ({ transit, gochara, onClose }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();

  const panelBg   = isLight ? '#ffffff'              : 'rgba(8,8,16,0.98)';
  const panelBdr  = isLight ? '#D1DCE5'              : 'rgba(139,92,246,0.2)';
  const headerBg  = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(8,8,16,0.95)';
  const titleClr  = isLight ? '#0f172a'              : '#ffffff';
  const subClr    = isLight ? '#64748b'              : 'rgba(255,255,255,0.42)';
  const bodyClr   = isLight ? '#374151'              : 'rgba(255,255,255,0.72)';
  const mutedClr  = isLight ? '#94a3b8'              : 'rgba(255,255,255,0.38)';
  const cardBg    = isLight ? '#f8fafc'              : 'rgba(255,255,255,0.03)';
  const cardBdr   = isLight ? '#E2E8F0'              : 'rgba(255,255,255,0.06)';
  const backdropBg = isLight ? 'rgba(15,23,42,0.25)' : 'rgba(0,0,0,0.5)';

  const planet = transit?.planet ?? '';
  const symbol = PLANET_SYMBOLS[planet] ?? '';
  const color = PLANET_COLORS[planet] ?? ACCENT;

  // ── Calculated, plain-language reading ─────────────────────────────────────
  const reading = transit ? buildReading(transit, gochara, lang) : null;

  const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="rounded-xl p-4" style={{ background: cardBg, border: `1px solid ${cardBdr}` }}>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: mutedClr }}>{title}</span>
      </div>
      {children}
    </div>
  );

  return (
    <AnimatePresence>
      {transit && reading && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: backdropBg }}
          />
          <motion.div
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md overflow-y-auto"
            style={{ background: panelBg, borderLeft: `1px solid ${panelBdr}` }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4"
              style={{ background: headerBg, borderBottom: `1px solid ${cardBdr}`, backdropFilter: 'blur(12px)' }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black" style={{ color, textShadow: `0 0 12px ${color}55` }}>{symbol}</span>
                <div>
                  <h2 className="text-base font-bold" style={{ color: titleClr }}>{labelPlanet(planet, lang)}</h2>
                  <p className="text-[11px] font-mono" style={{ color: subClr }}>
                    {labelRashi(transit.rashi, lang, RASHIS[transit.rashi])} · {transit.rashiDegree.toFixed(1)}°{transit.isRetrograde ? ' ℞' : ''}
                  </p>
                </div>
              </div>
              <button onClick={onClose} aria-label="Close"
                className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: subClr }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 pb-10">
              {/* Verdict banner */}
              <div className="rounded-xl p-4" style={{ background: `${toneColor(reading.verdict.tone)}14`, border: `1px solid ${toneColor(reading.verdict.tone)}40` }}>
                <div className="flex items-center gap-2 mb-1.5">
                  {reading.verdict.tone === 'good' ? <CheckCircle2 className="w-4 h-4" style={{ color: toneColor('good') }} />
                    : reading.verdict.tone === 'bad' ? <AlertTriangle className="w-4 h-4" style={{ color: toneColor('bad') }} />
                    : <Info className="w-4 h-4" style={{ color: toneColor('neutral') }} />}
                  <span className="text-sm font-bold" style={{ color: toneColor(reading.verdict.tone) }}>{reading.verdict.label}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{reading.verdict.text}</p>
              </div>

              <Section title={t('insights.trMeaning')}>
                <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{reading.meaning}</p>
              </Section>

              <Section title={t('insights.trPlacement')}>
                <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{reading.placement}</p>
                {transit.note && <p className="text-[12px] italic mt-2" style={{ color: mutedClr }}>{transit.note}</p>}
              </Section>

              {reading.condition.length > 0 && (
                <Section title={t('insights.trCondition')}>
                  <ul className="space-y-1.5">
                    {reading.condition.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: bodyClr }}>
                        <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: toneColor(c.tone) }} />
                        {c.text}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              <Section title={t('insights.trNatal')}>
                {reading.natal.length === 0 ? (
                  <p className="text-sm" style={{ color: mutedClr }}>{t('insights.trNoNatal')}</p>
                ) : (
                  <ul className="space-y-2">
                    {reading.natal.map((n, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color: bodyClr }}>
                        <span className="mt-0.5 shrink-0" style={{ color: ACCENT }}>›</span>
                        {n}
                      </li>
                    ))}
                  </ul>
                )}
              </Section>

              {/* Takeaway */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(var(--c-accent-rgb),0.05)', border: '1px solid rgba(var(--c-accent-rgb),0.2)' }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Info className="w-3.5 h-3.5" style={{ color: 'var(--c-accent-2)' }} />
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: mutedClr }}>{t('insights.trTakeaway')}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: bodyClr }}>{reading.takeaway}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Plain-language reading builder ───────────────────────────────────────────────

type Lang = ReturnType<typeof useLang>['lang'];

interface Reading {
  meaning: string;
  placement: string;
  verdict: { label: string; text: string; tone: Tone };
  condition: { text: string; tone: Tone }[];
  natal: string[];
  takeaway: string;
}

function natalTheme(planet: string, lang: Lang): string {
  if (planet === 'ASCENDANT') return pick(TR_FALLBACK.ascTheme, lang);
  return labelPlanetTheme(planet, lang) || pick(TR_FALLBACK.areas, lang);
}
function natalName(planet: string, lang: Lang): string {
  return planet === 'ASCENDANT' ? pick(TR_FALLBACK.ascName, lang) : labelPlanet(planet, lang);
}

function buildReading(tr: PlanetTransit, g: GocharaSnapshot, lang: Lang): Reading {
  const name = labelPlanet(tr.planet, lang);
  const t = (b: Bi) => pick(b, lang);
  const meaning = TR.meaning(name, labelPlanetTheme(tr.planet, lang) || t(TR_FALLBACK.themes), lang);

  const classical = gocharaEffect(tr.planet, tr.houseFromMoon, lang);
  const sign = labelRashi(tr.rashi, lang, RASHIS[tr.rashi]);
  const placement =
    TR.placement({
      name, sign, houseL: ordinalNum(tr.houseFromLagna, lang),
      theme: labelHouseTheme(tr.houseFromLagna, lang), houseM: ordinalNum(tr.houseFromMoon, lang),
    }, lang) +
    (classical ? TR.classical(classical, lang) : '');

  const kind: Tone = tr.valence > 0 ? 'good' : tr.valence < 0 ? 'bad' : 'neutral';
  const verdict = { label: t(TR.verdictLabel[kind as 'good' | 'bad' | 'neutral']), tone: kind, text: TR.verdictText(kind as 'good' | 'bad' | 'neutral', name, lang) };

  const condition: { text: string; tone: Tone }[] = [];
  if (tr.dignity === 'exalted') condition.push({ text: t(TR.exalted), tone: 'good' });
  else if (tr.dignity === 'own-sign') condition.push({ text: t(TR.ownSign), tone: 'good' });
  else if (tr.dignity === 'debilitated') condition.push({ text: TR.debilitated(sign, lang), tone: 'bad' });
  if (tr.combust) condition.push({ text: t(TR.combust), tone: 'bad' });
  if (tr.bindus != null) {
    const bk = tr.bindus >= 5 ? 'high' : tr.bindus <= 2 ? 'low' : 'mid';
    condition.push({ text: TR.bindus(tr.bindus, bk, lang), tone: bk === 'high' ? 'good' : bk === 'low' ? 'bad' : 'neutral' });
  }
  if (tr.isRetrograde) condition.push({ text: t(TR.retro), tone: 'neutral' });
  if (tr.stationary) condition.push({ text: t(TR.stationary), tone: 'neutral' });
  if (tr.vedha) condition.push({ text: TR.vedha(labelPlanet(tr.vedha.byPlanet, lang), lang), tone: 'bad' });
  if (tr.gandanta) condition.push({ text: t(TR.gandanta), tone: 'bad' });
  if (tr.war) condition.push({ text: TR.war(labelPlanet(tr.war.with, lang), lang), tone: 'bad' });

  const natal = computeTransitNatal(g)
    .filter(h => h.transit === tr.planet && h.transit !== h.natal && (h.kind === 'conjunction' ? (h.orb ?? 99) <= 12 : h.virupa >= 30))
    .slice(0, 5)
    .map(h =>
      h.kind === 'conjunction'
        ? TR.natalConj({ name, natal: natalName(h.natal, lang), orb: h.orb, theme: natalTheme(h.natal, lang) }, lang)
        : TR.natalAspect({ name, natal: natalName(h.natal, lang), pct: Math.round((h.virupa / 60) * 100), theme: natalTheme(h.natal, lang) }, lang),
    );

  const takeaway = TR.takeaway(kind as 'good' | 'bad' | 'neutral', name, lang) + (natal.length ? t(TR.natalTail) : '');

  return { meaning, placement, verdict, condition, natal, takeaway };
}

export default TransitDetailPanel;
