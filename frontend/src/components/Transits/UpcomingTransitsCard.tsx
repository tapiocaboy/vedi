/**
 * UpcomingTransitsCard — a forward-looking transit calendar for the Now tab:
 * every sign ingress and retrograde/direct station in the next ~45 days, each
 * with a countdown and a personal impact badge ("Will support you" / "Will
 * test you") read from the natal Moon, expandable to the full effect text and
 * the classical gochara reading for the house being entered.
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, Loader2, ArrowRight, RotateCcw, ChevronDown, Sparkles } from 'lucide-react';
import { getUpcomingTransits, type UpcomingTransitEvent } from '../../lib/core/monthlyTransits';
import { gocharaEffect } from '../../lib/core/gocharaPhala';
import type { AyanamsaSystem } from '../../lib/core/transits';
import { PLANET_SYMBOLS, planetDisplayColor } from '../../types/astrology';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet } from '../../i18n/astroLabels';

interface Props {
  ayanamsa: AyanamsaSystem;
  natalMoonRashi: number;
  natalLagnaRashi: number;
  horizonDays?: number;
}

export const UpcomingTransitsCard: React.FC<Props> = ({ ayanamsa, natalMoonRashi, natalLagnaRashi, horizonDays = 45 }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const [open, setOpen] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['upcoming-transits', ayanamsa, natalMoonRashi, natalLagnaRashi, horizonDays],
    queryFn: () => getUpcomingTransits(ayanamsa, natalMoonRashi, natalLagnaRashi, horizonDays),
    staleTime: 60 * 60_000, // ingress dates are stable for an hour easily
  });

  const head = isLight ? 'text-gray-800' : 'text-white';
  const body = isLight ? 'text-slate-600' : 'text-white/70';
  const sub = isLight ? 'text-slate-400' : 'text-white/35';
  const rowCls = isLight ? 'border-slate-200 bg-slate-50' : 'border-white/8 bg-black/20';

  const impact = (v: number) =>
    v > 0
      ? { label: t('upcoming.willHelp'), cls: 'text-emerald-400 bg-emerald-500/15' }
      : v < 0
        ? { label: t('upcoming.willTest'), cls: 'text-rose-400 bg-rose-500/15' }
        : { label: t('upcoming.mixed'), cls: isLight ? 'text-slate-500 bg-slate-200' : 'text-white/50 bg-white/10' };

  const headline = (ev: UpcomingTransitEvent) =>
    ev.type === 'ingress'
      ? `${labelPlanet(ev.planet, lang)} ${t('monthly.enters')} ${ev.toRashiName}`
      : `${labelPlanet(ev.planet, lang)} ${ev.type === 'retrograde' ? t('monthly.retro') : t('monthly.direct')} · ${ev.toRashiName}`;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="glass-card rounded-2xl p-3 sm:p-6">
      <div className="flex items-start gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
          <CalendarClock className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-sm font-bold ${head}`}>{t('upcoming.title')}</h3>
          <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/30'}`}>{t('upcoming.subtitle')}</p>
        </div>
      </div>

      {isLoading && (
        <div className={`flex items-center gap-2 justify-center py-8 text-sm ${sub}`}>
          <Loader2 className="w-4 h-4 animate-spin" /> {t('upcoming.computing')}
        </div>
      )}

      {data && data.events.length === 0 && (
        <div className={`flex items-start gap-2 rounded-xl border p-4 text-sm ${rowCls} ${body}`}>
          <Sparkles className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--c-accent-2)' }} />
          <span>{t('upcoming.none', { n: horizonDays })}</span>
        </div>
      )}

      {data && data.events.length > 0 && (
        <div className="space-y-1.5">
          {data.events.map(ev => {
            const key = `${ev.planet}-${ev.type}-${ev.date}`;
            const isOpen = open === key;
            const chip = impact(ev.valence);
            const Icon = ev.type === 'ingress' ? ArrowRight : RotateCcw;
            const color = planetDisplayColor(ev.planet, isLight);
            return (
              <div key={key} className={`rounded-xl border overflow-hidden ${rowCls}`}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : key)}
                  aria-expanded={isOpen}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-colors ${isLight ? 'hover:bg-slate-100' : 'hover:bg-white/5'}`}
                >
                  <span className="text-[15px] font-bold leading-none shrink-0" style={{ color }}>
                    {PLANET_SYMBOLS[ev.planet]}
                  </span>
                  <Icon className={`w-3 h-3 shrink-0 ${sub}`} />
                  <span className={`text-xs font-semibold ${head}`}>{headline(ev)}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${chip.cls}`}>
                    {chip.label}
                  </span>
                  <span className={`ml-auto text-[10px] font-mono shrink-0 ${sub}`}>
                    {fmtDate(ev.date)} · {ev.daysUntil === 0 ? t('upcoming.today') : t('upcoming.inDays', { n: ev.daysUntil })}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''} ${sub}`} />
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 pt-2 space-y-2 border-t" style={{ borderColor: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)' }}>
                    <p className={`text-[12px] leading-relaxed ${body}`}>{ev.effect}</p>
                    {ev.type === 'ingress' && (
                      <p className={`text-[11px] leading-relaxed italic ${sub}`}>
                        {gocharaEffect(ev.planet, ev.houseFromMoon)}
                      </p>
                    )}
                    <ul className="space-y-1">
                      {ev.themes.map((th, i) => (
                        <li key={i} className={`text-[11px] leading-relaxed flex gap-1.5 ${body}`}>
                          <span className="shrink-0" style={{ color: 'var(--c-accent-2)' }}>•</span>
                          <span>{th}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingTransitsCard;
