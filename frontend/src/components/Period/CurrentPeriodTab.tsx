import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Clock, Compass, MapPin, AlertTriangle, Sparkles, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { getCurrentPeriodSnapshot, type BirthData, type CurrentLocation, type PeriodSnapshot } from '../../services/api';
import { BAR_PALETTE, DashaBarRow } from '../shared/BarCharts';
import { useLang } from '../../i18n/LanguageContext';
import { labelArea, labelDashaLevel, labelPlanet } from '../../i18n/astroLabels';

interface Props {
  birthData: BirthData;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function ratingColor(r: number): string {
  if (r >= 8) return 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30';
  if (r >= 6) return 'text-violet-300 bg-violet-500/15 border-violet-400/30';
  if (r >= 4) return 'text-amber-300 bg-amber-500/15 border-amber-400/30';
  return 'text-rose-300 bg-rose-500/15 border-rose-400/30';
}

function valenceClass(v: number): string {
  if (v > 0) return 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300';
  if (v < 0) return 'bg-rose-500/10 border-rose-400/30 text-rose-300';
  return 'bg-white/4 border-white/8 text-white/60';
}

const PeriodBanner: React.FC<{ snap: PeriodSnapshot }> = ({ snap }) => {
  const { lang, t } = useLang();
  const cp   = snap.currentPeriods;
  const nowMs = new Date(snap.gochara.asOf).getTime();

  const rows = [
    { label: labelDashaLevel('Mahadasha', lang),      lord: cp.mahadasha.lord,      start: cp.mahadasha.start,      end: cp.mahadasha.end      },
    { label: labelDashaLevel('Antardasha', lang),     lord: cp.antardasha.lord,     start: cp.antardasha.start,     end: cp.antardasha.end     },
    ...(cp.pratyantardasha ? [{ label: labelDashaLevel('Pratyantardasha', lang), lord: cp.pratyantardasha.lord, start: cp.pratyantardasha.start, end: cp.pratyantardasha.end }] : []),
    ...(cp.sookshmaDasha   ? [{ label: labelDashaLevel('Sookshma Dasha', lang),  lord: cp.sookshmaDasha.lord,   start: cp.sookshmaDasha.start,   end: cp.sookshmaDasha.end   }] : []),
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: `${BAR_PALETTE.plum}cc`,
            border: `1px solid ${BAR_PALETTE.pink}30`,
          }}
        >
          <Clock className="w-4 h-4" style={{ color: BAR_PALETTE.gold }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{t('dasha.activeTitle')}</h3>
          <p className="text-[11px] text-white/40">
            {rows.map(r => labelPlanet(r.lord, lang)).join(' · ')}
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-md border text-[11px] font-mono ${ratingColor(snap.prediction.overallRating)}`}>
          {snap.prediction.overallRating}/10
        </div>
      </div>

      <div className="space-y-5">
        {rows.map((r, i) => (
          <DashaBarRow key={r.label} {...r} lord={labelPlanet(r.lord, lang)} nowMs={nowMs} index={i} />
        ))}
      </div>

      <p className="text-xs text-white/70 mt-5 leading-relaxed border-t border-white/6 pt-4">
        {snap.prediction.overallTheme}
      </p>
    </div>
  );
};

const TransitsCard: React.FC<{ snap: PeriodSnapshot }> = ({ snap }) => {
  const { lang, t } = useLang();
  const g = snap.gochara;
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,46,81,0.08)', border: '1px solid rgba(255,46,81,0.18)' }}>
          <Compass className="w-4 h-4" style={{ color: '#ff6b81' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{t('now.transitsTitle')}</h3>
          <p className="text-[11px] text-white/40">{t('now.transitsSubtitle')}</p>
        </div>
        <div className="text-[10px] font-mono text-white/30">{fmtDate(g.asOf)}</div>
      </div>

      {/* Big callouts: Sade Sati + Jupiter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className={`rounded-xl border p-3 ${g.sadeSati.active ? 'border-amber-400/30 bg-amber-500/8' : 'border-emerald-400/25 bg-emerald-500/6'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-3.5 h-3.5 ${g.sadeSati.active ? 'text-amber-300' : 'text-emerald-300'}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white">{t('now.sadeSati')}</span>
          </div>
          <div className="text-[11px] text-white/70 leading-relaxed">{g.sadeSati.description}</div>
        </div>
        <div className={`rounded-xl border p-3 ${g.jupiterBlessing.auspicious ? 'border-emerald-400/30 bg-emerald-500/8' : 'border-white/10 bg-white/4'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className={`w-3.5 h-3.5 ${g.jupiterBlessing.auspicious ? 'text-emerald-300' : 'text-white/40'}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white">{t('now.guruTransit')}</span>
          </div>
          <div className="text-[11px] text-white/70 leading-relaxed">{g.jupiterBlessing.reason}</div>
        </div>
      </div>

      {/* Transit list */}
      <div className="space-y-1">
        {g.transits.map(tr => (
          <div key={tr.planet} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] ${valenceClass(tr.valence)}`}>
            <span className="font-semibold w-16 text-white">{labelPlanet(tr.planet, lang)}</span>
            <span className="font-mono text-white/70">{tr.rashiName}</span>
            <span className="text-white/30 font-mono text-[10px]">{tr.rashiDegree.toFixed(1)}°</span>
            {tr.isRetrograde && <span className="text-amber-300/80 text-[10px] font-mono">R</span>}
            <span className="text-white/30 ml-auto text-[10px] font-mono">{tr.houseFromMoon}H Moon · {tr.houseFromLagna}H {t('chart.lagna')}</span>
            {tr.note && <span className="basis-full text-[10px] text-white/60 italic">{tr.note}</span>}
          </div>
        ))}
      </div>
      <div className="text-[10px] text-white/30">{g.nodalShift.note}</div>
    </div>
  );
};

const LocationCard: React.FC<{
  current: CurrentLocation | null;
  setCurrent: (l: CurrentLocation | null) => void;
  relocation: PeriodSnapshot['relocation'];
}> = ({ current, setCurrent, relocation }) => {
  const { lang, t } = useLang();
  const [lat, setLat] = useState(current ? String(current.latitude) : '');
  const [lon, setLon] = useState(current ? String(current.longitude) : '');
  const [tz, setTz] = useState(current ? current.timezone : Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [enabled, setEnabled] = useState(!!current);

  function apply() {
    const latN = parseFloat(lat), lonN = parseFloat(lon);
    if (!Number.isFinite(latN) || !Number.isFinite(lonN) || !tz) return;
    setCurrent({ latitude: latN, longitude: lonN, timezone: tz });
  }
  function clear() {
    setEnabled(false);
    setCurrent(null);
  }

  return (
    <div className="glass-card rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,46,81,0.08)', border: '1px solid rgba(255,46,81,0.18)' }}>
          <MapPin className="w-4 h-4" style={{ color: '#ff6b81' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{t('now.relocationTitle')}</h3>
          <p className="text-[11px] text-white/40">{t('now.relocationSubtitle')}</p>
        </div>
        {!enabled ? (
          <button onClick={() => setEnabled(true)} className="text-xs px-3 py-1.5 rounded-lg border text-white/70 hover:text-white" style={{ background: 'rgba(255,46,81,0.12)', borderColor: 'rgba(255,46,81,0.25)' }}>
            {t('now.setLocation')}
          </button>
        ) : (
          <button onClick={clear} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
            {t('now.useBirthLocation')}
          </button>
        )}
      </div>

      {enabled && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <label className="text-[10px] uppercase tracking-wider text-white/40">
              {t('form.latitude')}
              <input value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. 51.5074" className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-white/40">
              {t('form.longitude')}
              <input value={lon} onChange={e => setLon(e.target.value)} placeholder="e.g. -0.1278" className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-white/40">
              {t('form.timezone')}
              <input value={tz} onChange={e => setTz(e.target.value)} placeholder="Europe/London" className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" />
            </label>
          </div>
          <button onClick={apply} className="text-xs px-3 py-1.5 rounded-lg border text-white hover:opacity-90" style={{ background: 'rgba(255,46,81,0.18)', borderColor: 'rgba(255,46,81,0.35)' }}>
            {t('now.applyLocation')}
          </button>
        </div>
      )}

      {relocation && (
        <div className="rounded-xl border p-4 mt-2" style={{ borderColor: 'rgba(255,46,81,0.18)', background: 'rgba(255,46,81,0.04)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wider text-white/50">{t('now.relocatedChart')}</div>
            <div className="text-[10px] font-mono text-white/40">
              {relocation.location.latitude.toFixed(3)}, {relocation.location.longitude.toFixed(3)} · {relocation.location.timezone}
            </div>
          </div>
          <div className="text-sm text-white">
            {t('now.newAscendant')}: <span className="font-semibold text-white">{relocation.chart.ascendantRashiName}</span>{' '}
            <span className="text-white/40 font-mono text-xs">{relocation.chart.ascendantRashiDegree}°</span>
          </div>
          <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">
            {t('now.relocationExplain')}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 mt-3">
            {Object.entries(relocation.chart.planetHouses).map(([p, h]) => (
              <div key={p} className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-white/80 flex items-center justify-between">
                <span>{labelPlanet(p, lang)}</span>
                <span className="font-mono text-white/80">{h}H</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PlaybookCard: React.FC<{ snap: PeriodSnapshot }> = ({ snap }) => {
  const { t } = useLang();
  const pb = snap.playbook;
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,46,81,0.08)', border: '1px solid rgba(255,46,81,0.18)' }}>
          <Zap className="w-4 h-4" style={{ color: '#ff6b81' }} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">{t('now.playbookTitle')}</h3>
          <p className="text-[11px] text-white/40">{t('now.playbookSubtitle')}</p>
        </div>
      </div>

      <div className="rounded-xl border p-3" style={{ borderColor: 'rgba(255,46,81,0.18)', background: 'rgba(255,46,81,0.04)' }}>
        <div className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,107,129,0.75)' }}>{t('now.decisionWindow')}</div>
        <p className="text-xs text-white/80 leading-relaxed">{pb.decisionWindow}</p>
      </div>

      <div className="rounded-xl border border-white/8 bg-black/30 p-3">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{t('now.next30Days')}</div>
        <p className="text-xs text-white/70 leading-relaxed">{pb.monthAhead}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-200/70 mb-2">{t('now.favourableDays')}</div>
          {pb.bestDays.length ? (
            <div className="flex flex-wrap gap-1.5">
              {pb.bestDays.map(d => <span key={d} className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[11px] text-emerald-200">{d}</span>)}
            </div>
          ) : <div className="text-[11px] text-white/40">{t('now.noFavourableDays')}</div>}
        </div>
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-rose-200/70 mb-2">{t('now.avoidDays')}</div>
          {pb.avoidDays.length ? (
            <div className="flex flex-wrap gap-1.5">
              {pb.avoidDays.map(d => <span key={d} className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-400/30 text-[11px] text-rose-200">{d}</span>)}
            </div>
          ) : <div className="text-[11px] text-white/40">{t('now.noAvoidDays')}</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/8 bg-black/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-200/70 mb-2">{t('now.opportunities')}</div>
          <ul className="space-y-1">
            {pb.opportunities.map((o, i) => (
              <li key={i} className="text-[11px] text-white/75 leading-relaxed flex gap-2">
                <ArrowRight className="w-3 h-3 mt-0.5 text-emerald-300/70 shrink-0" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-white/8 bg-black/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-rose-200/70 mb-2">{t('now.pitfalls')}</div>
          <ul className="space-y-1">
            {pb.pitfalls.map((p, i) => (
              <li key={i} className="text-[11px] text-white/75 leading-relaxed flex gap-2">
                <AlertTriangle className="w-3 h-3 mt-0.5 text-rose-300/70 shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-white/8 bg-black/30 p-3">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{t('now.dailyPractice')}</div>
        <div className="text-[11px] text-white/75"><span className="text-violet-300">{t('now.mantra')}:</span> {pb.dailyPractice.mantra || '—'}</div>
        <div className="text-[11px] text-white/75 mt-0.5"><span className="text-violet-300">{t('now.charity')}:</span> {pb.dailyPractice.charity || '—'}</div>
        {snap.prediction.remedies.gemstone && (
          <div className="text-[11px] text-white/75 mt-0.5"><span className="text-violet-300">{t('remedy.gemstone')}:</span> {snap.prediction.remedies.gemstone} {t('now.gemstoneNote')}</div>
        )}
        {snap.prediction.remedies.deity && (
          <div className="text-[11px] text-white/75 mt-0.5"><span className="text-violet-300">{t('now.deity')}:</span> {snap.prediction.remedies.deity}</div>
        )}
      </div>
    </div>
  );
};

const PredictionDetailsCard: React.FC<{ snap: PeriodSnapshot }> = ({ snap }) => {
  const { lang, t } = useLang();
  const areas = snap.prediction.predictions;
  const order: Array<{ key: keyof typeof areas; area: string }> = [
    { key: 'career', area: 'career' },
    { key: 'wealth', area: 'wealth' },
    { key: 'relationships', area: 'relationships' },
    { key: 'health', area: 'health' },
    { key: 'general', area: 'general' },
  ];
  return (
    <div className="glass-card rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,46,81,0.08)', border: '1px solid rgba(255,46,81,0.18)' }}>
          <Sparkles className="w-4 h-4" style={{ color: '#ff6b81' }} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{t('now.periodAnalysisTitle')}</h3>
          <p className="text-[11px] text-white/40">{t('now.periodAnalysisSubtitle')}</p>
        </div>
      </div>
      {order.map(({ key, area }) => {
        const a = areas[key];
        if (!a) return null;
        return (
          <div key={key} className="rounded-xl border border-white/8 bg-black/30 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[11px] uppercase tracking-wider text-white/50">{labelArea(area, lang)}</div>
              <div className="text-[10px] text-white/40 font-mono">{a.intensity}</div>
            </div>
            <p className="text-xs text-white/85 mb-2 leading-relaxed">{a.summary}</p>
            {a.details.length > 0 && (
              <ul className="space-y-1">
                {a.details.slice(0, 4).map((d, i) => (
                  <li key={i} className="text-[11px] text-white/60 leading-relaxed flex gap-2">
                    <span className="text-violet-400 shrink-0">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CurrentPeriodTab: React.FC<Props> = ({ birthData }) => {
  const { t } = useLang();
  const [currentLocation, setCurrentLocation] = useState<CurrentLocation | null>(null);

  // Stable key so the query re-runs when location changes.
  const queryKey = useMemo(
    () => ['period-snapshot', birthData, currentLocation],
    [birthData, currentLocation],
  );

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => getCurrentPeriodSnapshot(birthData, currentLocation ?? undefined),
    staleTime: 5 * 60_000, // 5 min — transits don't move fast
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-white/40 text-sm py-12 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> {t('now.computing')}
      </div>
    );
  }
  if (error || !data) {
    return <div className="glass-card rounded-2xl p-6 text-rose-300 text-sm">{t('now.failed')}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <PeriodBanner snap={data} />
      <PredictionDetailsCard snap={data} />
      <TransitsCard snap={data} />
      <LocationCard current={currentLocation} setCurrent={setCurrentLocation} relocation={data.relocation} />
      <PlaybookCard snap={data} />
    </motion.div>
  );
};
