import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Clock, Compass, MapPin, AlertTriangle, Sparkles, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { getCurrentPeriodSnapshot, type BirthData, type CurrentLocation, type PeriodSnapshot } from '../../services/api';

interface Props {
  birthData: BirthData;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function ratingColor(r: number): string {
  if (r >= 8) return 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30';
  if (r >= 6) return 'text-sky-300 bg-sky-500/15 border-sky-400/30';
  if (r >= 4) return 'text-amber-300 bg-amber-500/15 border-amber-400/30';
  return 'text-rose-300 bg-rose-500/15 border-rose-400/30';
}

function valenceClass(v: number): string {
  if (v > 0) return 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300';
  if (v < 0) return 'bg-rose-500/10 border-rose-400/30 text-rose-300';
  return 'bg-white/4 border-white/8 text-white/60';
}

const PeriodBanner: React.FC<{ snap: PeriodSnapshot }> = ({ snap }) => {
  const cp = snap.currentPeriods;
  const rows: Array<{ label: string; lord: string; ends: string; days: number }> = [
    { label: 'Mahadasha',       lord: cp.mahadasha.lord,       ends: cp.mahadasha.end,       days: cp.mahadasha.daysRemaining },
    { label: 'Antardasha',      lord: cp.antardasha.lord,      ends: cp.antardasha.end,      days: cp.antardasha.daysRemaining },
    ...(cp.pratyantardasha ? [{ label: 'Pratyantardasha', lord: cp.pratyantardasha.lord, ends: cp.pratyantardasha.end, days: cp.pratyantardasha.daysRemaining }] : []),
    ...(cp.sookshmaDasha   ? [{ label: 'Sookshma',        lord: cp.sookshmaDasha.lord,   ends: cp.sookshmaDasha.end,   days: cp.sookshmaDasha.daysRemaining }]   : []),
  ];
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
          <Clock className="w-4 h-4 text-violet-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Current Period</h3>
          <p className="text-[11px] text-white/40">Nested dasha lords running for this person right now</p>
        </div>
        <div className={`px-2.5 py-1 rounded-md border text-[11px] font-mono ${ratingColor(snap.prediction.overallRating)}`}>
          {snap.prediction.overallRating}/10
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {rows.map(r => (
          <div key={r.label} className="rounded-xl border border-white/8 bg-black/30 px-3 py-2.5 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">{r.label}</div>
              <div className="text-sm font-semibold text-white">{r.lord}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/40">ends {fmtDate(r.ends)}</div>
              <div className="text-[10px] font-mono text-white/60">{r.days}d left</div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-white/70 mt-4 leading-relaxed">{snap.prediction.overallTheme}</p>
    </div>
  );
};

const TransitsCard: React.FC<{ snap: PeriodSnapshot }> = ({ snap }) => {
  const g = snap.gochara;
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
          <Compass className="w-4 h-4 text-violet-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Current Transits (Gochara)</h3>
          <p className="text-[11px] text-white/40">Where each planet is right now, and how it affects your natal Moon & Lagna</p>
        </div>
        <div className="text-[10px] font-mono text-white/30">{fmtDate(g.asOf)}</div>
      </div>

      {/* Big callouts: Sade Sati + Jupiter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className={`rounded-xl border p-3 ${g.sadeSati.active ? 'border-amber-400/30 bg-amber-500/8' : 'border-emerald-400/25 bg-emerald-500/6'}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-3.5 h-3.5 ${g.sadeSati.active ? 'text-amber-300' : 'text-emerald-300'}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Sade Sati</span>
          </div>
          <div className="text-[11px] text-white/70 leading-relaxed">{g.sadeSati.description}</div>
        </div>
        <div className={`rounded-xl border p-3 ${g.jupiterBlessing.auspicious ? 'border-emerald-400/30 bg-emerald-500/8' : 'border-white/10 bg-white/4'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className={`w-3.5 h-3.5 ${g.jupiterBlessing.auspicious ? 'text-emerald-300' : 'text-white/40'}`} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white">Guru Transit</span>
          </div>
          <div className="text-[11px] text-white/70 leading-relaxed">{g.jupiterBlessing.reason}</div>
        </div>
      </div>

      {/* Transit list */}
      <div className="space-y-1">
        {g.transits.map(t => (
          <div key={t.planet} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] ${valenceClass(t.valence)}`}>
            <span className="font-semibold w-16 text-white">{t.planet}</span>
            <span className="font-mono text-white/70">{t.rashiName}</span>
            <span className="text-white/30 font-mono text-[10px]">{t.rashiDegree.toFixed(1)}°</span>
            {t.isRetrograde && <span className="text-amber-300/80 text-[10px] font-mono">R</span>}
            <span className="text-white/30 ml-auto text-[10px] font-mono">{t.houseFromMoon}H Moon · {t.houseFromLagna}H Lagna</span>
            {t.note && <span className="basis-full text-[10px] text-white/60 italic">{t.note}</span>}
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
        <div className="w-8 h-8 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-violet-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">Currently Living Somewhere Else?</h3>
          <p className="text-[11px] text-white/40">Re-cast your chart for your current location to see how houses shift</p>
        </div>
        {!enabled ? (
          <button onClick={() => setEnabled(true)} className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/15 border border-violet-400/30 text-violet-200 hover:bg-violet-500/25">
            Set location
          </button>
        ) : (
          <button onClick={clear} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10">
            Use birth location
          </button>
        )}
      </div>

      {enabled && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <label className="text-[10px] uppercase tracking-wider text-white/40">
              Latitude
              <input value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. 51.5074" className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-white/40">
              Longitude
              <input value={lon} onChange={e => setLon(e.target.value)} placeholder="e.g. -0.1278" className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-white/40">
              Timezone
              <input value={tz} onChange={e => setTz(e.target.value)} placeholder="Europe/London" className="mt-1 w-full bg-black/40 border border-white/10 rounded-md px-2 py-1.5 text-xs text-white" />
            </label>
          </div>
          <button onClick={apply} className="text-xs px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-400/40 text-violet-100 hover:bg-violet-500/30">
            Apply location
          </button>
        </div>
      )}

      {relocation && (
        <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wider text-violet-200/70">Relocated Chart</div>
            <div className="text-[10px] font-mono text-white/40">
              {relocation.location.latitude.toFixed(3)}, {relocation.location.longitude.toFixed(3)} · {relocation.location.timezone}
            </div>
          </div>
          <div className="text-sm text-white">
            New Ascendant: <span className="font-semibold text-violet-200">{relocation.chart.ascendantRashiName}</span>{' '}
            <span className="text-white/40 font-mono text-xs">{relocation.chart.ascendantRashiDegree}°</span>
          </div>
          <p className="text-[11px] text-white/50 mt-1.5 leading-relaxed">
            Planets stay where they were at birth, but the houses rotate around the new Ascendant. Use the house grid below to see where each natal planet now lands.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 mt-3">
            {Object.entries(relocation.chart.planetHouses).map(([p, h]) => (
              <div key={p} className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[11px] text-white/80 flex items-center justify-between">
                <span>{p}</span>
                <span className="font-mono text-violet-200">{h}H</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PlaybookCard: React.FC<{ snap: PeriodSnapshot }> = ({ snap }) => {
  const pb = snap.playbook;
  return (
    <div className="glass-card rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-violet-300" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">How to Use This Period</h3>
          <p className="text-[11px] text-white/40">Actionable guidance from the current dasha tree, transits, and Ashtakavarga strength</p>
        </div>
      </div>

      <div className="rounded-xl border border-violet-400/20 bg-violet-500/5 p-3">
        <div className="text-[10px] uppercase tracking-wider text-violet-200/70 mb-1">Decision window</div>
        <p className="text-xs text-white/80 leading-relaxed">{pb.decisionWindow}</p>
      </div>

      <div className="rounded-xl border border-white/8 bg-black/30 p-3">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Next 30 days</div>
        <p className="text-xs text-white/70 leading-relaxed">{pb.monthAhead}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-200/70 mb-2">Favourable days</div>
          {pb.bestDays.length ? (
            <div className="flex flex-wrap gap-1.5">
              {pb.bestDays.map(d => <span key={d} className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-400/30 text-[11px] text-emerald-200">{d}</span>)}
            </div>
          ) : <div className="text-[11px] text-white/40">No strong preference this period.</div>}
        </div>
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/5 p-3">
          <div className="text-[10px] uppercase tracking-wider text-rose-200/70 mb-2">Days to take it easy</div>
          {pb.avoidDays.length ? (
            <div className="flex flex-wrap gap-1.5">
              {pb.avoidDays.map(d => <span key={d} className="px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-400/30 text-[11px] text-rose-200">{d}</span>)}
            </div>
          ) : <div className="text-[11px] text-white/40">No high-caution days this period.</div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/8 bg-black/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-emerald-200/70 mb-2">Opportunities to lean into</div>
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
          <div className="text-[10px] uppercase tracking-wider text-rose-200/70 mb-2">Pitfalls to skip</div>
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
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Daily practice</div>
        <div className="text-[11px] text-white/75"><span className="text-violet-300">Mantra:</span> {pb.dailyPractice.mantra || '—'}</div>
        <div className="text-[11px] text-white/75 mt-0.5"><span className="text-violet-300">Charity:</span> {pb.dailyPractice.charity || '—'}</div>
        {snap.prediction.remedies.gemstone && (
          <div className="text-[11px] text-white/75 mt-0.5"><span className="text-violet-300">Gemstone:</span> {snap.prediction.remedies.gemstone} (consult an astrologer before wearing)</div>
        )}
        {snap.prediction.remedies.deity && (
          <div className="text-[11px] text-white/75 mt-0.5"><span className="text-violet-300">Deity to honour:</span> {snap.prediction.remedies.deity}</div>
        )}
      </div>
    </div>
  );
};

const PredictionDetailsCard: React.FC<{ snap: PeriodSnapshot }> = ({ snap }) => {
  const areas = snap.prediction.predictions;
  const order: Array<{ key: keyof typeof areas; label: string }> = [
    { key: 'career', label: 'Career' },
    { key: 'wealth', label: 'Wealth' },
    { key: 'relationships', label: 'Relationships' },
    { key: 'health', label: 'Health' },
    { key: 'general', label: 'General' },
  ];
  return (
    <div className="glass-card rounded-2xl p-6 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-violet-300" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Period Analysis</h3>
          <p className="text-[11px] text-white/40">Chart-aware reading — annotated with your natal house placements and Ashtakavarga strength</p>
        </div>
      </div>
      {order.map(({ key, label }) => {
        const a = areas[key];
        if (!a) return null;
        return (
          <div key={key} className="rounded-xl border border-white/8 bg-black/30 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[11px] uppercase tracking-wider text-white/50">{label}</div>
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
        <Loader2 className="w-4 h-4 animate-spin" /> Computing current period…
      </div>
    );
  }
  if (error || !data) {
    return <div className="glass-card rounded-2xl p-6 text-rose-300 text-sm">Failed to load current period.</div>;
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
