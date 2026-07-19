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
import { PLANET_SYMBOLS, PLANET_COLORS, RASHIS } from '../../types/astrology';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import {
  labelPlanet, labelPlanetTheme, labelRashi, labelHouseTheme,
} from '../../i18n/astroLabels';

const ACCENT = 'var(--c-accent)';

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function titleCase(s: string): string {
  return s.charAt(0) + s.slice(1).toLowerCase();
}

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
  if (planet === 'ASCENDANT') return 'your body, vitality and how you meet the world';
  return labelPlanetTheme(planet, lang) || 'its areas of life';
}
function natalName(planet: string, lang: Lang): string {
  return planet === 'ASCENDANT' ? 'Ascendant' : labelPlanet(planet, lang);
}

function buildReading(tr: PlanetTransit, g: GocharaSnapshot, lang: Lang): Reading {
  const name = labelPlanet(tr.planet, lang);
  const meaning = `${name} stands for ${labelPlanetTheme(tr.planet, lang) || 'its themes'}. Wherever it travels, it colours that part of your life.`;

  const classical = gocharaEffect(tr.planet, tr.houseFromMoon);
  const placement =
    `Right now ${name} is moving through ${labelRashi(tr.rashi, lang, RASHIS[tr.rashi])} — your ${ordinal(tr.houseFromLagna)} house (${labelHouseTheme(tr.houseFromLagna, lang)}), and the ${ordinal(tr.houseFromMoon)} place from your Moon.` +
    (classical ? ` The classical reading for this position: ${classical}` : '');

  const verdict =
    tr.valence > 0
      ? { label: 'Helping you now', tone: 'good' as Tone, text: `This is a supportive placement — ${name}'s themes tend to flow more easily and bring benefit at the moment.` }
      : tr.valence < 0
        ? { label: 'Needs care now', tone: 'bad' as Tone, text: `This is a demanding placement — ${name}'s themes ask for extra patience and care right now.` }
        : { label: 'Steady for now', tone: 'neutral' as Tone, text: `This is a neutral placement — ${name} is neither strongly helping nor holding you back at the moment.` };

  const condition: { text: string; tone: Tone }[] = [];
  if (tr.dignity === 'exalted') condition.push({ text: 'It is at its strongest (exalted) — able to give near-peak results.', tone: 'good' });
  else if (tr.dignity === 'own-sign') condition.push({ text: 'It sits in its own sign — comfortable, stable and dependable.', tone: 'good' });
  else if (tr.dignity === 'debilitated') condition.push({ text: `It is weakened (debilitated) in ${labelRashi(tr.rashi, lang, RASHIS[tr.rashi])} — its results are muted, so be patient.`, tone: 'bad' });
  if (tr.combust) condition.push({ text: 'It is too close to the Sun (combust) — its energy is dimmed for now.', tone: 'bad' });
  if (tr.bindus != null) {
    condition.push(
      tr.bindus >= 5
        ? { text: `It holds ${tr.bindus} of 8 support points (ashtakavarga bindus) in this sign — its results here are strengthened for you.`, tone: 'good' }
        : tr.bindus <= 2
          ? { text: `It holds only ${tr.bindus} of 8 support points (ashtakavarga bindus) in this sign — its results here are weakened for you.`, tone: 'bad' }
          : { text: `It holds ${tr.bindus} of 8 support points (ashtakavarga bindus) in this sign — an average level of support.`, tone: 'neutral' },
    );
  }
  if (tr.isRetrograde) condition.push({ text: 'It is retrograde — a time to review, revisit and finish things rather than start new ones.', tone: 'neutral' });
  if (tr.stationary) condition.push({ text: 'It is almost standing still (stationary) — an unusually powerful, pivotal moment for its themes.', tone: 'neutral' });
  if (tr.vedha) condition.push({ text: `Its good result is currently blocked (vedha) by ${titleCase(tr.vedha.byPlanet)}, so don't over-rely on it.`, tone: 'bad' });
  if (tr.gandanta) condition.push({ text: 'It sits at a delicate sign-junction (gandanta) — matters here feel a little unstable.', tone: 'bad' });
  if (tr.war) condition.push({ text: `It is in a close contest (planetary war) with ${titleCase(tr.war.with)} — the weaker planet's results suffer.`, tone: 'bad' });

  const natal = computeTransitNatal(g)
    .filter(h => h.transit === tr.planet && h.transit !== h.natal && (h.kind === 'conjunction' ? (h.orb ?? 99) <= 12 : h.virupa >= 30))
    .slice(0, 5)
    .map(h =>
      h.kind === 'conjunction'
        ? `${name} is sitting right on your natal ${natalName(h.natal, lang)} (${h.orb}° away) — strongly activating ${natalTheme(h.natal, lang)}.`
        : `${name} is casting a ${Math.round((h.virupa / 60) * 100)}% aspect on your natal ${natalName(h.natal, lang)} — stirring ${natalTheme(h.natal, lang)}.`,
    );

  const takeaway =
    (tr.valence > 0
      ? `A good window to lean into the areas above — take initiative where ${name} supports you.`
      : tr.valence < 0
        ? `Go gently in the areas above for now — avoid forcing outcomes and look after the basics.`
        : `Keep a steady routine in these areas — no strong push or pull from ${name} right now.`) +
    (natal.length ? ' The contacts to your birth chart are the clearest signs of real events during this transit.' : '');

  return { meaning, placement, verdict, condition, natal, takeaway };
}

export default TransitDetailPanel;
