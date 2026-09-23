/**
 * Where the two charts meet: each planet sits in the house it lands in on
 * the other person. Gold helps, rose strains. Planet-to-planet contacts
 * (no house) sit in a short bridge underneath. Motion is a single settle —
 * no loop, no 3D, no frame pump.
 *
 * Tap a planet for its sentence; tap a house to highlight that landing.
 * Only occupied houses are drawn — empty cells hid the picture.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import type { SynastryContact, SynastryResult } from '../../lib/core/matchSynastry';
import { contactRank, formatOrb } from '../../lib/core/matchSynastry';
import { PLANET_SYMBOLS, planetDisplayColor } from '../../types/astrology';
import { useTheme } from '../../hooks/useTheme';
import { useLang } from '../../i18n/LanguageContext';
import { labelPlanet } from '../../i18n/astroLabels';

const VALENCE_DARK = { supportive: '#f5c518', adverse: '#f87171', neutral: '#818cf8' } as const;
const VALENCE_LIGHT = { supportive: '#b8860b', adverse: '#dc2626', neutral: '#6366f1' } as const;
const valColor = (v: SynastryContact['valence'], isLight: boolean) =>
  (isLight ? VALENCE_LIGHT : VALENCE_DARK)[v];

const MAX_CONTACTS = 10;
const DUSTHANA = new Set([6, 8, 12]);

function houseOrdinal(n: number): string {
  const s = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
  return `${n}${s}`;
}

const TYPE_KEY: Record<string, string> = {
  'node on 7th lord': 'match.web.type.nodeSeventhLord',
  'node on ascendant': 'match.web.type.nodeAscendant',
  'Moon on ascendant': 'match.web.type.moonAscendant',
  'Saturn on Moon/Venus': 'match.web.type.saturnPress',
  'Saturn opposite Moon/Venus': 'match.web.type.saturnPress',
  'graha in dusthana': 'match.web.type.hardHouse',
  'malefic in 7th house': 'match.web.type.marriageHouse',
  '7th lord to 7th lord': 'match.web.type.axisLink',
  'Venus–Mars cross contact': 'match.web.type.attraction',
  'Venus–Mars opposition': 'match.web.type.attraction',
  'Moon opposite Moon': 'match.web.type.moonPolarity',
  'luminary to luminary': 'match.web.type.luminary',
  'Jupiter to Moon/ascendant': 'match.web.type.protection',
  'benefic in supportive house': 'match.web.type.gentleHouse',
};

function parseHouse(target: string): number | null {
  const m = target.match(/^(\d+)(?:st|nd|rd|th) house$/i);
  if (m) return Number(m[1]);
  if (target === 'Ascendant') return 1;
  return null;
}

function planetChip(target: string): string | null {
  const lord = target.match(/^(\w+) \(7th lord\)$/);
  if (lord) return lord[1];
  if (parseHouse(target) != null) return null;
  return target;
}

interface Placed {
  contact: SynastryContact;
  fromChip: string;
  toPlanet: string | null;
  house: number | null;
  leftToRight: boolean;
  rank: number;
}

function contactKey(p: Placed): string {
  const c = p.contact;
  return `${c.direction}-${c.graha}-${c.type}-${c.target}`;
}

type Side = 'left' | 'right';
type Focus =
  | { kind: 'planet'; side: Side; name: string }
  | { kind: 'house'; receiver: Side; house: number };

function matchesFocus(p: Placed, focus: Focus | null): boolean {
  if (!focus) return true;
  if (focus.kind === 'planet') {
    if (focus.side === 'left') {
      return p.leftToRight ? p.fromChip === focus.name : p.toPlanet === focus.name;
    }
    return p.leftToRight ? p.toPlanet === focus.name : p.fromChip === focus.name;
  }
  const inReceiver = focus.receiver === 'right' ? p.leftToRight : !p.leftToRight;
  return inReceiver && p.house === focus.house;
}

const ease = [0.22, 1, 0.36, 1] as const;

// ── Planet chip ──────────────────────────────────────────────────────────────

const PlanetDot: React.FC<{
  name: string;
  valence: SynastryContact['valence'];
  selected: boolean;
  dim: boolean;
  isLight: boolean;
  delay: number;
  reduced: boolean;
  title: string;
  onClick: (e: React.MouseEvent) => void;
}> = ({ name, valence, selected, dim, isLight, delay, reduced, title, onClick }) => {
  const color = name === 'Ascendant'
    ? (isLight ? '#be123c' : '#fb7185')
    : planetDisplayColor(name.toUpperCase(), isLight);
  const glyph = PLANET_SYMBOLS[name.toUpperCase()] ?? name.slice(0, 2);
  return (
    <motion.button
      type="button"
      title={title}
      aria-pressed={selected}
      onClick={onClick}
      initial={reduced ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: dim ? 0.22 : 1, y: 0, scale: selected ? 1.08 : 1 }}
      transition={{ duration: 0.4, delay, ease }}
      className="relative w-7 h-7 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: color,
        boxShadow: selected ? `0 0 0 2px ${valColor(valence, isLight)}` : 'none',
      }}
    >
      <span className="text-[11px] font-bold text-white leading-none">{glyph}</span>
      <span
        className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
        style={{
          background: valColor(valence, isLight),
          boxShadow: `0 0 0 1.5px ${isLight ? '#fff' : '#0b0f1a'}`,
        }}
      />
    </motion.button>
  );
};

// ── Twelve-house runway ──────────────────────────────────────────────────────

// ── Short planet-to-planet bridge (only contacts that are not a house) ───────

const PlanetBridge: React.FC<{
  contacts: Placed[];
  selectedKey: string | null;
  isLight: boolean;
  reduced: boolean;
  youLabel: string;
  partnerLabel: string;
  onSelect: (p: Placed) => void;
}> = ({ contacts, selectedKey, isLight, reduced, youLabel, partnerLabel, onSelect }) => {
  if (!contacts.length) return null;

  const leftNames = Array.from(new Set(contacts.map(p =>
    p.leftToRight ? p.fromChip : (p.toPlanet ?? p.fromChip))));
  const rightNames = Array.from(new Set(contacts.map(p =>
    p.leftToRight ? (p.toPlanet ?? p.fromChip) : p.fromChip)));

  const rowH = 36;
  const padY = 28;
  const h = Math.max(leftNames.length, rightNames.length) * rowH + padY * 2;
  const w = 320;
  const leftX = 36;
  const rightX = w - 36;
  const yOf = (list: string[], name: string) =>
    padY + list.indexOf(name) * rowH + rowH / 2;

  const faint = isLight ? 'text-slate-400' : 'text-white/35';
  const ink = isLight ? '#334155' : 'rgba(255,255,255,0.7)';

  return (
    <div className="mt-3">
      <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 px-0.5 ${faint}`}>
        {youLabel} · {partnerLabel}
      </div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-md mx-auto h-auto"
        role="img"
        aria-label={`${youLabel} ${partnerLabel}`}
      >
        <text x={leftX} y={14} textAnchor="middle" fill={ink} fontSize="9" fontWeight="700">
          {youLabel.toUpperCase()}
        </text>
        <text x={rightX} y={14} textAnchor="middle" fill={ink} fontSize="9" fontWeight="700">
          {partnerLabel.toUpperCase()}
        </text>
        {contacts.map((p, i) => {
          const from = p.leftToRight ? p.fromChip : (p.toPlanet ?? p.fromChip);
          const to = p.leftToRight ? (p.toPlanet ?? p.fromChip) : p.fromChip;
          const y1 = yOf(leftNames, from);
          const y2 = yOf(rightNames, to);
          const color = valColor(p.contact.valence, isLight);
          const key = contactKey(p);
          const dim = selectedKey != null && selectedKey !== key;
          const mid = (leftX + rightX) / 2;
          return (
            <motion.path
              key={key}
              d={`M ${leftX + 14} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${rightX - 14} ${y2}`}
              fill="none"
              stroke={color}
              strokeWidth={p.contact.valence === 'adverse' ? 1.4 : 2.2}
              strokeDasharray={p.contact.valence === 'adverse' ? '3.5 5' : undefined}
              strokeLinecap="round"
              opacity={dim ? 0.18 : 0.9}
              initial={reduced ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.55, delay: 0.15 + i * 0.06, ease }}
              className="cursor-pointer"
              onClick={() => onSelect(p)}
            />
          );
        })}
        {leftNames.map(name => {
          const y = yOf(leftNames, name);
          const color = planetDisplayColor(name.toUpperCase(), isLight);
          return (
            <g key={`L-${name}`}>
              <circle cx={leftX} cy={y} r="11" fill={color} />
              <text x={leftX} y={y + 3.5} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
                {PLANET_SYMBOLS[name.toUpperCase()] ?? name.slice(0, 2)}
              </text>
            </g>
          );
        })}
        {rightNames.map(name => {
          const y = yOf(rightNames, name);
          const color = planetDisplayColor(name.toUpperCase(), isLight);
          return (
            <g key={`R-${name}`}>
              <circle cx={rightX} cy={y} r="11" fill={color} />
              <text x={rightX} y={y + 3.5} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">
                {PLANET_SYMBOLS[name.toUpperCase()] ?? name.slice(0, 2)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── The picture ──────────────────────────────────────────────────────────────

const LandingBoard: React.FC<{
  visible: Placed[];
  selectedKey: string | null;
  focus: Focus | null;
  isLight: boolean;
  youLabel: string;
  partnerLabel: string;
  planetLabel: (name: string) => string;
  ariaLabel: string;
  onSelect: (p: Placed) => void;
  onHouse: (receiver: Side, house: number) => void;
}> = ({
  visible, selectedKey, focus, isLight, youLabel, partnerLabel,
  planetLabel, ariaLabel, onSelect, onHouse,
}) => {
  const reduced = !!useReducedMotion();
  const youOnto = visible.filter(p => p.leftToRight && p.house != null);
  const themOnto = visible.filter(p => !p.leftToRight && p.house != null);
  const links = visible.filter(p => p.house == null);

  return (
    <div role="img" aria-label={ariaLabel} className="space-y-4 p-3 sm:p-4 pr-12">
      <HouseRunway
        label={`${youLabel} → ${partnerLabel}`}
        receiver="right"
        entries={youOnto}
        selectedKey={selectedKey}
        focus={focus}
        isLight={isLight}
        reduced={reduced}
        onSelect={onSelect}
        onHouse={h => onHouse('right', h)}
        planetLabel={planetLabel}
      />
      <HouseRunway
        label={`${partnerLabel} → ${youLabel}`}
        receiver="left"
        entries={themOnto}
        selectedKey={selectedKey}
        focus={focus}
        isLight={isLight}
        reduced={reduced}
        onSelect={onSelect}
        onHouse={h => onHouse('left', h)}
        planetLabel={planetLabel}
      />
      <PlanetBridge
        contacts={links}
        selectedKey={selectedKey}
        isLight={isLight}
        reduced={reduced}
        youLabel={youLabel}
        partnerLabel={partnerLabel}
        onSelect={onSelect}
      />
    </div>
  );
};

const HouseRunway: React.FC<{
  label: string;
  receiver: Side;
  entries: Placed[];
  selectedKey: string | null;
  focus: Focus | null;
  isLight: boolean;
  reduced: boolean;
  onSelect: (p: Placed) => void;
  onHouse: (house: number) => void;
  planetLabel: (name: string) => string;
}> = ({
  label, receiver, entries, selectedKey, focus, isLight, reduced,
  onSelect, onHouse, planetLabel,
}) => {
  const houses = Array.from(new Set(
    entries.map(p => p.house).filter((h): h is number => h != null),
  )).sort((a, b) => a - b);
  if (!houses.length) return null;

  const faint = isLight ? 'text-slate-400' : 'text-white/35';
  const houseFocused = (h: number) =>
    focus?.kind === 'house' && focus.receiver === receiver && focus.house === h;

  return (
    <div>
      <div className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 px-0.5 ${faint}`}>
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {houses.map(h => {
          const here = entries.filter(p => p.house === h);
          const on = houseFocused(h);
          const hasAdverse = here.some(p => p.contact.valence === 'adverse');
          const hasHelp = here.some(p => p.contact.valence === 'supportive');
          const dimCard = focus?.kind === 'house' && !on;
          const tint = DUSTHANA.has(h)
            ? (isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-500/10 border-rose-400/25')
            : h === 7
              ? (isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-400/10 border-amber-300/25')
              : (isLight ? 'bg-white border-slate-200' : 'bg-white/6 border-white/12');
          return (
            <button
              key={h}
              type="button"
              onClick={() => onHouse(h)}
              aria-pressed={on}
              className={`rounded-2xl border px-3 pt-2 pb-2.5 min-w-[4.75rem] flex flex-col items-center gap-1.5 transition-opacity ${tint} ${
                on ? 'ring-1 ring-[var(--c-accent)]' : ''
              }`}
              style={{ opacity: dimCard ? 0.4 : 1 }}
            >
              <span className={`text-[10px] font-mono font-semibold ${
                hasAdverse ? 'text-rose-400' : hasHelp ? (isLight ? 'text-amber-700' : 'text-amber-300') : faint
              }`}>
                {houseOrdinal(h)}
              </span>
              <div className="flex flex-wrap justify-center gap-1">
                {here.map((p, i) => {
                  const key = contactKey(p);
                  const dim = (selectedKey != null && selectedKey !== key)
                    || (focus != null && !matchesFocus(p, focus));
                  return (
                    <PlanetDot
                      key={key}
                      name={p.fromChip}
                      valence={p.contact.valence}
                      selected={selectedKey === key}
                      dim={dim}
                      isLight={isLight}
                      delay={reduced ? 0 : 0.08 + i * 0.045}
                      reduced={!!reduced}
                      title={`${planetLabel(p.fromChip)} → ${houseOrdinal(h)}`}
                      onClick={e => { e.stopPropagation(); onSelect(p); }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ── Contact sentences ────────────────────────────────────────────────────────

const ContactRows: React.FC<{
  contacts: Placed[];
  selectedKey: string | null;
  onSelect: (p: Placed) => void;
  isLight: boolean;
}> = ({ contacts, selectedKey, onSelect, isLight }) => {
  const { lang, t } = useLang();
  const reduced = !!useReducedMotion();
  const plainType = (c: SynastryContact) => t((TYPE_KEY[c.type] ?? 'match.web.type.other') as 'match.web.type.other');
  const faint = isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.07)';
  return (
    <div className="space-y-1.5">
      {contacts.map((p, i) => {
        const c = p.contact;
        const color = valColor(c.valence, isLight);
        const key = contactKey(p);
        const isSel = selectedKey === key;
        return (
          <motion.button
            key={key}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.12 + i * 0.035, duration: 0.3, ease }}
            onClick={() => onSelect(p)}
            aria-pressed={isSel}
            className="w-full text-left rounded-lg px-3 py-2 transition-colors"
            style={{
              borderStyle: `solid solid solid ${c.valence === 'adverse' ? 'dotted' : 'solid'}`,
              borderWidth: '1px 1px 1px 3px',
              borderColor: isSel
                ? `${color} ${color} ${color} ${color}`
                : `${faint} ${faint} ${faint} ${color}`,
              background: isSel
                ? `${color}14`
                : isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)',
            }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11.5px] font-bold" style={{ color }}>
                {labelPlanet(c.graha.toUpperCase(), lang)} → {c.target}
              </span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                style={{ background: `${color}1c`, color }}>
                {plainType(c)}
              </span>
              <span className={`ml-auto text-[9.5px] font-mono ${isLight ? 'text-slate-400' : 'text-white/35'}`}>
                {p.leftToRight ? t('match.web.yourSide') : t('match.web.partnerSide')}
                {c.orb != null ? ` · ${formatOrb(c.orb)}` : ''}
              </span>
            </div>
            {isSel && (
              <motion.p
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`text-[11.5px] leading-relaxed mt-1.5 overflow-hidden ${isLight ? 'text-slate-600' : 'text-white/70'}`}
              >
                {c.interpretation}
              </motion.p>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// ── Section ──────────────────────────────────────────────────────────────────

export const SynastryWeb: React.FC<{ synastry: SynastryResult }> = ({ synastry }) => {
  const isLight = useTheme();
  const { lang, t } = useLang();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [focus, setFocus] = useState<Focus | null>(null);
  const [filter, setFilter] = useState<'all' | 'supportive' | 'adverse'>('all');
  const [expanded, setExpanded] = useState(false);

  const placed = useMemo<Placed[]>(() => {
    const all = [...synastry.aToB.contacts, ...synastry.bToA.contacts]
      .map(contact => ({
        contact,
        fromChip: contact.graha,
        toPlanet: planetChip(contact.target),
        house: parseHouse(contact.target),
        leftToRight: contact.direction === 'a-to-b',
        rank: contactRank(contact),
      }))
      .sort((x, y) => y.rank - x.rank);
    return all.slice(0, MAX_CONTACTS);
  }, [synastry]);

  const visible = useMemo(() =>
    placed.filter(p => filter === 'all' || p.contact.valence === filter),
    [placed, filter]);

  const rows = useMemo(() => visible.filter(p => matchesFocus(p, focus)), [visible, focus]);

  const supportiveCount = placed.filter(p => p.contact.valence === 'supportive').length;
  const adverseCount = placed.filter(p => p.contact.valence === 'adverse').length;

  const planetLabel = (name: string) =>
    name === 'Ascendant' ? t('match.web.asc') : labelPlanet(name.toUpperCase(), lang);

  const toggleFilter = (v: 'supportive' | 'adverse') => {
    setSelectedKey(null);
    setFocus(null);
    setFilter(f => (f === v ? 'all' : v));
  };
  const selectRow = (p: Placed) => {
    const key = contactKey(p);
    setSelectedKey(sel => (sel === key ? null : key));
    if (focus && !matchesFocus(p, focus)) setFocus(null);
  };
  const onHouse = (receiver: Side, house: number) => {
    setSelectedKey(null);
    setFocus(f =>
      f?.kind === 'house' && f.receiver === receiver && f.house === house
        ? null
        : { kind: 'house', receiver, house });
  };

  useEffect(() => {
    if (focus && !visible.some(p => matchesFocus(p, focus))) setFocus(null);
  }, [visible, focus]);

  useEffect(() => {
    if (!expanded) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [expanded]);

  const board = (
    <LandingBoard
      visible={visible}
      selectedKey={selectedKey}
      focus={focus}
      isLight={isLight}
      youLabel={t('match.web.you')}
      partnerLabel={t('match.web.partner')}
      planetLabel={planetLabel}
      ariaLabel={t('match.web.aria')}
      onSelect={selectRow}
      onHouse={onHouse}
    />
  );

  const legend = (
    <>
      {([['supportive', supportiveCount, t('match.web.helpCount', { n: supportiveCount })],
         ['adverse', adverseCount, t('match.web.strainCount', { n: adverseCount })]] as Array<['supportive' | 'adverse', number, string]>)
        .map(([v, count, label]) => (
          <button
            key={v}
            onClick={() => toggleFilter(v)}
            disabled={count === 0}
            aria-pressed={filter === v}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors disabled:opacity-40 disabled:cursor-default"
            style={{
              borderColor: filter === v ? valColor(v, isLight) : 'transparent',
              background: `${valColor(v, isLight)}${filter === v ? '24' : '0f'}`,
            }}
          >
            {v === 'supportive'
              ? <span className="w-4 h-1.5 rounded-full" style={{ background: valColor(v, isLight) }} />
              : <span className="w-4 border-t-2 border-dotted" style={{ borderColor: valColor(v, isLight) }} />}
            <span className={isLight ? 'text-slate-600' : 'text-white/70'}>{label}</span>
          </button>
        ))}
      {focus && (
        <button
          onClick={() => setFocus(null)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border ${isLight ? 'text-slate-600' : 'text-white/70'}`}
          style={{
            borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.15)',
            background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)',
          }}
        >
          ✕ {focus.kind === 'house' ? houseOrdinal(focus.house) : planetLabel(focus.name)}
        </button>
      )}
    </>
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-2 text-[11px] flex-wrap">
        {legend}
        <span className={`ml-auto hidden sm:inline ${isLight ? 'text-slate-400' : 'text-white/35'}`}>{t('match.web.dragHint')}</span>
      </div>

      <div className="relative sky-well overflow-hidden rounded-2xl">
        {!expanded && board}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            aria-label={t('match.web.expand')}
            title={t('match.web.expand')}
            className="absolute top-2 right-2 p-2 rounded-lg border transition-colors"
            style={{
              borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.14)',
              background: isLight ? 'rgba(255,255,255,0.75)' : 'rgba(11,15,30,0.6)',
              color: isLight ? '#334155' : 'rgba(255,255,255,0.75)',
            }}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3">
        <ContactRows contacts={rows} selectedKey={selectedKey} onSelect={selectRow} isLight={isLight} />
      </div>

      {expanded && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('match.webTitle')}
          className="fixed inset-0 z-[80] flex flex-col"
          style={{ background: isLight ? '#f8fafc' : '#070914' }}
        >
          <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 pb-2 flex-wrap">
            <div className="mr-2">
              <h3 className="text-sm font-semibold" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                {t('match.webTitle')}
              </h3>
              <p className="text-[11px]" style={{ color: isLight ? '#64748b' : 'rgba(255,255,255,0.4)' }}>
                {t('match.web.dragHint')}
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] flex-wrap">{legend}</div>
            <button
              onClick={() => setExpanded(false)}
              aria-label={t('match.web.close')}
              className="ml-auto p-2 rounded-lg border transition-colors"
              style={{
                borderColor: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.14)',
                color: isLight ? '#334155' : 'rgba(255,255,255,0.75)',
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 px-3 sm:px-6 pb-4 overflow-y-auto">
            <div className="flex-1 min-w-0">{board}</div>
            <div className="lg:w-[360px] shrink-0 overflow-y-auto min-h-0 max-h-[34vh] lg:max-h-none">
              <ContactRows contacts={rows} selectedKey={selectedKey} onSelect={selectRow} isLight={isLight} />
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
};
