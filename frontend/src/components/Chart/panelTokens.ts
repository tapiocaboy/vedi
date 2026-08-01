/**
 * Colour tokens shared by the chart side panels.
 *
 * HouseDetailPanel and the planet-pair pane sit next to each other on screen,
 * so they have to resolve their surfaces from one place — a private copy in
 * each file drifts, and the seam between the two panes shows it immediately.
 */

export interface PanelTokens {
  panelBg: string;
  panelBdr: string;
  headerBg: string;
  headerBdr: string;
  titleClr: string;
  subClr: string;
  bodyClr: string;
  mutedClr: string;
  cardBg: string;
  cardBdr: string;
  secBg: string;
  secBdr: string;
  divClr: string;
  backdropBg: string;
}

export function panelTokens(isLight: boolean): PanelTokens {
  return {
    panelBg:    isLight ? '#ffffff'                : 'rgba(8,8,16,0.98)',
    panelBdr:   isLight ? '#D1DCE5'                : 'rgba(139,92,246,0.2)',
    headerBg:   isLight ? 'rgba(255,255,255,0.97)' : 'rgba(8,8,16,0.95)',
    headerBdr:  isLight ? '#E2E8F0'                : 'rgba(139,92,246,0.12)',
    titleClr:   isLight ? '#0f172a'                : '#ffffff',
    subClr:     isLight ? '#64748b'                : 'rgba(255,255,255,0.40)',
    bodyClr:    isLight ? '#374151'                : 'rgba(255,255,255,0.65)',
    mutedClr:   isLight ? '#94a3b8'                : 'rgba(255,255,255,0.35)',
    cardBg:     isLight ? '#f8fafc'                : 'rgba(255,255,255,0.03)',
    cardBdr:    isLight ? '#E2E8F0'                : 'rgba(255,255,255,0.07)',
    secBg:      isLight ? '#f1f5f9'                : 'rgba(255,255,255,0.04)',
    secBdr:     isLight ? '#D1DCE5'                : 'rgba(255,255,255,0.07)',
    divClr:     isLight ? '#E2E8F0'                : 'rgba(255,255,255,0.05)',
    backdropBg: isLight ? 'rgba(15,23,42,0.25)'    : 'rgba(0,0,0,0.50)',
  };
}

/** Quality colours shared by the pair meters, chips and dial. */
export const VERDICT_COLOR: Record<string, string> = {
  'very-supportive': '#10b981',
  supportive:        '#22c55e',
  mixed:             '#eab308',
  straining:         '#f59e0b',
  difficult:         '#ef4444',
};

/**
 * The same five verdicts darkened for a white panel. The dark-theme yellows and
 * greens are picked to glow against near-black; on white they wash out, and the
 * verdict is what the tap affordance is coloured by — it has to stay legible.
 */
const VERDICT_COLOR_LIGHT: Record<string, string> = {
  'very-supportive': '#047857',
  supportive:        '#15803d',
  mixed:             '#a16207',
  straining:         '#b45309',
  difficult:         '#dc2626',
};

export const verdictColor = (verdict: string, isLight: boolean): string =>
  (isLight ? VERDICT_COLOR_LIGHT[verdict] : VERDICT_COLOR[verdict]) ?? VERDICT_COLOR[verdict];

export const ACTIVATION_COLOR: Record<string, string> = {
  peak:       '#10b981',
  high:       '#22c55e',
  moderate:   '#eab308',
  background: '#94a3b8',
};

export const POWER_COLOR = '#10b981';
export const DRAG_COLOR = '#f43f5e';
