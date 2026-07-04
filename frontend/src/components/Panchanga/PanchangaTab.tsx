import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Loader2, Sunrise, Sunset, Clock, ShieldAlert, Star } from 'lucide-react';
import { getPanchanga } from '../../services/api';
import type { BirthData } from '../../services/api';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';

const ACCENT = 'var(--c-accent)';

function fmtTime(iso: string | null, timeZone: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString('en-US', { timeZone, hour: '2-digit', minute: '2-digit' });
  } catch {
    return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
}

function LimbCard({
  label, value, sub, accent, isLight, delay,
}: {
  label: string; value: string; sub: string; accent: string; isLight: boolean; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl p-3"
      style={{
        background: isLight ? '#ffffff' : 'rgba(0,0,0,0.35)',
        border: isLight ? '1px solid #D1DCE5' : '1px solid rgba(255,255,255,0.08)',
        borderTop: `2px solid ${accent}`,
      }}
    >
      <div className={`text-[9px] uppercase tracking-widest font-bold mb-1 ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
        {label}
      </div>
      <div className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{value}</div>
      <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>{sub}</div>
    </motion.div>
  );
}

function TimingRow({
  icon: Icon, label, value, tone, isLight,
}: {
  icon: React.ElementType; label: string; value: string; tone: 'good' | 'bad' | 'plain'; isLight: boolean;
}) {
  const color = tone === 'good' ? '#10b981' : tone === 'bad' ? '#f43f5e' : (isLight ? '#64748b' : '#94a3b8');
  return (
    <div className={`flex items-center justify-between py-2 border-b last:border-0 ${isLight ? 'border-slate-100' : 'border-white/5'}`}>
      <span className="flex items-center gap-2 text-xs font-semibold" style={{ color }}>
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
      <span className={`text-xs font-mono font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{value}</span>
    </div>
  );
}

export const PanchangaTab: React.FC<{ birthData: BirthData; asOf?: Date }> = ({ birthData, asOf }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const asOfKey = asOf ? asOf.toISOString().slice(0, 10) : 'now';
  const { data, isLoading, isError } = useQuery({
    queryKey: ['panchanga', birthData.latitude, birthData.longitude, asOfKey],
    queryFn: () => getPanchanga(birthData, asOf),
    staleTime: 5 * 60 * 1000, // panchanga shifts through the day
  });

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <Loader2 className="w-6 h-6 mx-auto animate-spin mb-3" style={{ color: ACCENT }} />
        <span className={`font-mono text-sm ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
          {t('panchanga.computing')}
        </span>
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center text-rose-400 text-sm">
        {t('panchanga.failed')}
      </div>
    );
  }

  const { panchanga, moonNakshatra } = data;
  const tz = birthData.timezone;
  const dateLabel = new Date(data.asOf).toLocaleDateString(lang === 'si' ? 'si-LK' : 'en-US', {
    timeZone: tz, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-4">
      {/* Header + five limbs */}
      <div className="glass-card rounded-2xl p-3 sm:p-6">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.18)' }}>
            <CalendarDays className="w-4 h-4" style={{ color: 'var(--c-accent-2)' }} />
          </div>
          <h3 className={`text-sm font-bold ${isLight ? 'text-gray-800' : 'text-white'}`}>{t('panchanga.title')}</h3>
        </div>
        <p className={`text-xs mb-4 ml-[2.625rem] ${isLight ? 'text-slate-500' : 'text-white/30'}`}>
          {dateLabel} · {t('panchanga.computedFor')} ({data.location.latitude.toFixed(2)}°, {data.location.longitude.toFixed(2)}°)
        </p>

        {/* Auspiciousness banner */}
        <div className="rounded-xl px-3 py-2.5 mb-4 flex items-center gap-2 text-xs font-bold"
          style={{
            background: panchanga.isAuspicious ? 'rgba(16,185,129,0.10)' : 'rgba(244,63,94,0.08)',
            border: `1px solid ${panchanga.isAuspicious ? 'rgba(16,185,129,0.30)' : 'rgba(244,63,94,0.25)'}`,
            color: panchanga.isAuspicious ? '#10b981' : '#fb7185',
          }}>
          <Star className="w-3.5 h-3.5" />
          {panchanga.isAuspicious ? t('panchanga.auspicious') : t('panchanga.mixed')}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          <LimbCard label={t('panchanga.tithi')} delay={0}
            value={`${panchanga.tithi.name}`}
            sub={t('panchanga.tithiSub', { paksha: panchanga.tithi.paksha, lord: panchanga.tithi.lord })}
            accent="#f59e0b" isLight={isLight} />
          <LimbCard label={t('panchanga.vara')} delay={0.05}
            value={panchanga.vara.sanskritName}
            sub={t('panchanga.varaSub', { day: panchanga.vara.name, lord: panchanga.vara.lord })}
            accent="#38bdf8" isLight={isLight} />
          <LimbCard label={t('panchanga.nakshatra')} delay={0.1}
            value={`${moonNakshatra.name}`}
            sub={t('panchanga.nakshatraSub', { pada: moonNakshatra.pada, lord: moonNakshatra.lord, gana: moonNakshatra.gana })}
            accent="#a78bfa" isLight={isLight} />
          <LimbCard label={t('panchanga.yoga')} delay={0.15}
            value={panchanga.yoga.name}
            sub={panchanga.yoga.nature === 'benefic' ? t('panchanga.yogaBenefic') : t('panchanga.yogaMalefic')}
            accent={panchanga.yoga.nature === 'benefic' ? '#10b981' : '#f43f5e'} isLight={isLight} />
          <LimbCard label={t('panchanga.karana')} delay={0.2}
            value={panchanga.karana.name}
            sub={t('panchanga.karanaSub', { type: panchanga.karana.type })}
            accent="#fb923c" isLight={isLight} />
        </div>

        {panchanga.specialNotes.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {panchanga.specialNotes.map((n, i) => (
              <div key={i} className={`text-xs flex items-start gap-2 ${isLight ? 'text-slate-600' : 'text-white/55'}`}>
                <Star className="w-3 h-3 mt-0.5 shrink-0" style={{ color: ACCENT }} />
                {n}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Timings */}
        <div className="glass-card rounded-2xl p-3 sm:p-5">
          <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isLight ? 'text-gray-800' : 'text-white'}`}>
            <Clock className="w-4 h-4" style={{ color: ACCENT }} /> {t('panchanga.keyTimings')}
            <span className={`text-[9px] font-mono font-normal ${isLight ? 'text-slate-400' : 'text-white/25'}`}>({tz})</span>
          </h3>
          <TimingRow icon={Sunrise} label={t('panchanga.sunrise')} tone="plain" isLight={isLight}
            value={fmtTime(data.sunrise, tz)} />
          <TimingRow icon={Sunset} label={t('panchanga.sunset')} tone="plain" isLight={isLight}
            value={fmtTime(data.sunset, tz)} />
          {data.abhijitMuhurta && (
            <TimingRow icon={Star} label={t('panchanga.abhijit')} tone="good" isLight={isLight}
              value={`${fmtTime(data.abhijitMuhurta.start, tz)} – ${fmtTime(data.abhijitMuhurta.end, tz)}`} />
          )}
          {data.rahuKaal && (
            <TimingRow icon={ShieldAlert} label={t('panchanga.rahuKaal')} tone="bad" isLight={isLight}
              value={`${fmtTime(data.rahuKaal.start, tz)} – ${fmtTime(data.rahuKaal.end, tz)}`} />
          )}
          {data.gulikaKaal && (
            <TimingRow icon={ShieldAlert} label={t('panchanga.gulikaKaal')} tone="bad" isLight={isLight}
              value={`${fmtTime(data.gulikaKaal.start, tz)} – ${fmtTime(data.gulikaKaal.end, tz)}`} />
          )}
        </div>

        {/* Choghadiya */}
        <div className="glass-card rounded-2xl p-3 sm:p-5">
          <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isLight ? 'text-gray-800' : 'text-white'}`}>
            <CalendarDays className="w-4 h-4" style={{ color: ACCENT }} /> {t('panchanga.choghadiya')}
          </h3>
          {data.choghadiya.length === 0 ? (
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
              {t('panchanga.notAvailable')}
            </p>
          ) : (
            <div className="space-y-1.5">
              {data.choghadiya.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
                  style={{
                    background: c.isGood
                      ? (isLight ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.08)')
                      : (isLight ? 'rgba(244,63,94,0.05)' : 'rgba(244,63,94,0.06)'),
                    border: `1px solid ${c.isGood ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.20)'}`,
                  }}
                >
                  <span className="text-xs font-bold" style={{ color: c.isGood ? '#10b981' : '#fb7185' }}>
                    {c.name}
                    <span className={`ml-1.5 font-normal text-[9px] ${isLight ? 'text-slate-400' : 'text-white/30'}`}>
                      {c.nature} · {c.lord}
                    </span>
                  </span>
                  <span className={`text-[10px] font-mono font-bold ${isLight ? 'text-gray-700' : 'text-white/70'}`}>
                    {fmtTime(c.start, tz)} – {fmtTime(c.end, tz)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
