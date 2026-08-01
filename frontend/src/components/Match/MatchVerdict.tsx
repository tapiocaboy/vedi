/**
 * The plain-words opening of the match report: an animated dial for the
 * traditional point count, and a four-check strip that says in ordinary
 * language what each layer of the engine found and where to read further.
 *
 * Deliberately not a grade. The engine's design refuses a single verdict —
 * the four layers measure different things and their disagreements are the
 * report's most useful output — so this banner summarises each layer
 * separately and words the headline as where to look, never as a score for
 * the relationship.
 */

import { useEffect, useState } from 'react';
import { motion, animate, useReducedMotion } from 'framer-motion';
import { Brain, Star, ShieldAlert, ArrowLeftRight, Check, X, AlertTriangle } from 'lucide-react';
import type { MatchSummary } from '../../services/api';
import { useLang } from '../../i18n/LanguageContext';
import { useTheme } from '../../hooks/useTheme';

type CheckState = 'good' | 'caution' | 'bad';

const STATE_COLOR: Record<CheckState, string> = {
  good: '#34d399', caution: '#fbbf24', bad: '#fb7185',
};
const STATE_ICON: Record<CheckState, React.ElementType> = {
  good: Check, caution: AlertTriangle, bad: X,
};

/** The animated ring for the koota total, with the classical gate marked. */
const ScoreDial: React.FC<{ total: number; pass: boolean }> = ({ total, pass }) => {
  const { t } = useLang();
  const isLight = useTheme();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? total : 0);

  // Count the number up in step with the ring sweep.
  useEffect(() => {
    if (reduced) { setShown(total); return; }
    const controls = animate(0, total, {
      duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2,
      onUpdate: v => setShown(Math.round(v * 2) / 2),
    });
    return () => controls.stop();
  }, [total, reduced]);

  const R = 52, C = 2 * Math.PI * R;
  const frac = Math.max(0, Math.min(1, total / 36));
  const gateAngle = (18 / 36) * 360 - 90;
  const gx = 60 + (R + 7) * Math.cos((gateAngle * Math.PI) / 180);
  const gy = 60 + (R + 7) * Math.sin((gateAngle * Math.PI) / 180);
  const ringColor = total >= 24 ? '#34d399' : pass ? '#fbbf24' : '#fb7185';
  const track = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.08)';

  return (
    <svg viewBox="0 0 120 132" className="w-32 h-auto shrink-0" role="img"
      aria-label={t('match.dial.aria', { n: total })}>
      <circle cx="60" cy="60" r={R} fill="none" stroke={track} strokeWidth="8" />
      <motion.circle
        cx="60" cy="60" r={R} fill="none"
        stroke={ringColor} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={C}
        transform="rotate(-90 60 60)"
        initial={{ strokeDashoffset: C }}
        animate={{ strokeDashoffset: C * (1 - frac) }}
        transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      {/* The classical gate at 18 — the line the total is traditionally read against. */}
      <circle cx={gx} cy={gy} r="2.5" fill={isLight ? '#94a3b8' : 'rgba(255,255,255,0.4)'} />
      <text x="60" y="56" textAnchor="middle" fontSize="26" fontWeight="800" fontFamily="monospace"
        fill={isLight ? '#0f172a' : '#ffffff'}>
        {shown}
      </text>
      <text x="60" y="72" textAnchor="middle" fontSize="10" fontFamily="monospace"
        fill={isLight ? '#94a3b8' : 'rgba(255,255,255,0.35)'}>
        / 36
      </text>
      <text x="60" y="126" textAnchor="middle" fontSize="8.5"
        fill={isLight ? '#64748b' : 'rgba(255,255,255,0.40)'}>
        {t('match.dial.caption')}
      </text>
    </svg>
  );
};

export const MatchVerdict: React.FC<{ summary: MatchSummary }> = ({ summary }) => {
  const { t } = useLang();
  const r = summary.report;

  // ── The four layer summaries, each in three states ──
  const l1 = r.layer1Temperament;
  const gatePassed = l1.gate === 'GATE_PASS';
  const minds: CheckState = l1.total >= 24 ? 'good' : gatePassed ? 'caution' : 'bad';

  const criticalStars = r.poruthams.checks.filter(c => c.importance === 'critical');
  const starsFailed = criticalStars.filter(c => !c.passed).length;
  const supportiveMissed = r.poruthams.checks.some(c => c.importance === 'supportive' && !c.passed);
  const stars: CheckState = starsFailed > 0 ? 'bad' : supportiveMissed ? 'caution' : 'good';

  const doshaActive = r.layer2Doshas.netA === 'active' || r.layer2Doshas.netB === 'active';
  const doshaMitigated = r.layer2Doshas.netA === 'mitigated' || r.layer2Doshas.netB === 'mitigated';
  const doshas: CheckState = doshaActive ? 'bad' : doshaMitigated ? 'caution' : 'good';

  const netA = r.layer4Synastry.aToB.netValence;
  const netB = r.layer4Synastry.bToA.netValence;
  const bothAdverse = netA <= -0.5 && netB <= -0.5;
  const overlay: CheckState = bothAdverse ? 'bad' : r.layer4Synastry.asymmetric || Math.min(netA, netB) <= -0.5 ? 'caution' : 'good';

  const checks: Array<{ key: string; state: CheckState; icon: React.ElementType; label: string; note: string }> = [
    { key: 'minds',   state: minds,   icon: Brain,          label: t('match.check.minds'),   note: t(`match.check.minds.${minds}` as 'match.check.minds.good') },
    { key: 'stars',   state: stars,   icon: Star,           label: t('match.check.stars'),   note: t(`match.check.stars.${stars}` as 'match.check.stars.good') },
    { key: 'doshas',  state: doshas,  icon: ShieldAlert,    label: t('match.check.doshas'),  note: t(`match.check.doshas.${doshas}` as 'match.check.doshas.good') },
    { key: 'overlay', state: overlay, icon: ArrowLeftRight, label: t('match.check.overlay'), note: t(`match.check.overlay.${overlay}` as 'match.check.overlay.good') },
  ];

  // The headline names where to look, not a grade.
  const badCount = checks.filter(c => c.state === 'bad').length;
  const cautionCount = checks.filter(c => c.state === 'caution').length;
  const headline = badCount === 0 && cautionCount === 0 ? t('match.headline.clear')
    : badCount === 0 ? t('match.headline.mostlyClear')
    : badCount === 1 ? t('match.headline.oneArea')
    : t('match.headline.severalAreas');

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <ScoreDial total={l1.total} pass={gatePassed} />

        <div className="flex-1 min-w-0 w-full">
          <motion.p
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-[13px] text-white/85 leading-relaxed font-medium mb-3"
          >
            {headline}
          </motion.p>

          <div className="grid grid-cols-2 gap-2">
            {checks.map((c, i) => {
              const color = STATE_COLOR[c.state];
              const StateIcon = STATE_ICON[c.state];
              return (
                <motion.div
                  key={c.key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.45 + i * 0.12, type: 'spring', stiffness: 300, damping: 24 }}
                  className="rounded-lg border px-2.5 py-2"
                  style={{ borderColor: `${color}44`, background: `${color}0d` }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <c.icon className="w-3 h-3 shrink-0" style={{ color }} />
                    <span className="text-[10.5px] font-bold text-white/85 truncate">{c.label}</span>
                    <StateIcon className="w-3 h-3 ml-auto shrink-0" style={{ color }} />
                  </div>
                  <div className="text-[10px] leading-snug text-white/50">{c.note}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
