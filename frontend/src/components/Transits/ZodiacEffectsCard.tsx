/**
 * ZodiacEffectsCard — the classical "gochara phala for each rashi" table:
 * for every zodiac sign taken as Moon sign, what each currently transiting
 * planet brings (Brihat Samhita / Phaladeepika effect lines), with vedha
 * obstruction applied. The user's own janma rashi is highlighted and opened
 * by default; every other sign is one tap away.
 */

import React, { useMemo, useState } from 'react';
import { Globe2 } from 'lucide-react';
import type { GocharaSnapshot } from '../../lib/core/transits';
import { computeZodiacEffects, type ZodiacEffects } from '../../lib/core/gocharaPhala';
import { RASHIS, RASHI_ENGLISH, PLANET_SYMBOLS, PLANET_COLORS } from '../../types/astrology';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet, labelRashi, labelRashiWestern, labelOrdinalHouse } from '../../i18n/astroLabels';
import { TapBadge } from '../shared/tapTarget';

const ACCENT = 'var(--c-accent)';

interface Props {
  gochara: GocharaSnapshot;
  /** Render as its own glass card instead of a divider section inside one. */
  standalone?: boolean;
}

export const ZodiacEffectsCard: React.FC<Props> = ({ gochara, standalone }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const zodiacs = useMemo(() => computeZodiacEffects(gochara), [gochara]);
  const [open, setOpen] = useState<number | null>(gochara.natalMoonRashi);

  const head = isLight ? 'text-gray-800' : 'text-white';
  const body = isLight ? 'text-slate-600' : 'text-white/65';
  const sub  = isLight ? 'text-slate-400' : 'text-white/35';
  const rowBorder = isLight ? 'border-slate-200' : 'border-white/8';
  const rowBg = isLight ? 'bg-slate-50' : 'bg-black/20';

  const toneBadge = (tone: ZodiacEffects['tone']) =>
    tone === 'good' ? 'bg-emerald-500/15 text-emerald-400'
      : tone === 'bad' ? 'bg-rose-500/15 text-rose-400'
      : isLight ? 'bg-slate-200 text-slate-500' : 'bg-white/10 text-white/50';
  const toneWord = (tone: ZodiacEffects['tone']) =>
    tone === 'good' ? t('now.transitFavourable') : tone === 'bad' ? t('now.transitChallenging') : t('now.transitNeutral');
  const valenceDot = (v: number) => (v > 0 ? '#10b981' : v < 0 ? '#f43f5e' : '#94a3b8');

  return (
    <div
      className={standalone ? 'glass-card rounded-2xl p-5' : 'mt-4 pt-4 border-t'}
      style={standalone ? undefined : { borderColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Globe2 className="w-3.5 h-3.5" style={{ color: 'var(--c-accent-2)' }} />
        <span className={`text-xs font-bold uppercase tracking-wider ${head}`}>{t('now.zodiacEffectsTitle')}</span>
      </div>
      <p className={`text-[11px] mb-3 ${sub}`}>{t('now.zodiacEffectsSubtitle')}</p>

      <div className="space-y-1.5">
        {zodiacs.map(z => {
          const isMine = z.rashi === gochara.natalMoonRashi;
          const isOpen = open === z.rashi;
          return (
            <div
              key={z.rashi}
              className={`rounded-xl border overflow-hidden ${rowBorder} ${rowBg}`}
              style={isMine ? { borderColor: 'rgba(var(--c-accent-rgb),0.45)', background: 'rgba(var(--c-accent-rgb),0.05)' } : undefined}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : z.rashi)}
                aria-expanded={isOpen}
                data-open={isOpen}
                className="tap-row tap-blink w-full flex items-center gap-2 pl-5 pr-2 py-2 text-left transition-colors"
              >
                <span className={`text-xs font-bold ${head}`}>{labelRashi(z.rashi, lang, RASHIS[z.rashi])}</span>
                <span className={`text-[10px] ${sub}`}>{labelRashiWestern(z.rashi, lang, RASHI_ENGLISH[z.rashi])}</span>
                {isMine && (
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white on-accent" style={{ backgroundColor: ACCENT }}>
                    {t('now.zodiacYourSign')}
                  </span>
                )}
                <span className={`ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${toneBadge(z.tone)}`}>
                  {toneWord(z.tone)}
                </span>
                <TapBadge open={isOpen} direction="down" />
              </button>

              {isOpen && (
                <ul className="px-3 pb-3 pt-1 space-y-1.5 border-t" style={{ borderColor: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)' }}>
                  {z.effects.map(e => (
                    <li key={e.planet} className="flex items-start gap-2 text-[11px] leading-relaxed">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: valenceDot(e.valence) }} />
                      <span className="font-bold shrink-0" style={{ color: PLANET_COLORS[e.planet] }}>
                        {PLANET_SYMBOLS[e.planet]} {labelPlanet(e.planet, lang)}
                      </span>
                      <span className={`shrink-0 font-mono ${sub}`}>
                        {labelOrdinalHouse(e.house, lang)}{e.isRetrograde ? ' ℞' : ''}
                      </span>
                      <span className={body}>
                        {e.effect}
                        {e.vedhaBy && (
                          <span className="text-amber-400"> · {t('now.transitVedha')} ({labelPlanet(e.vedhaBy, lang)})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ZodiacEffectsCard;
