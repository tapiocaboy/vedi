import React from 'react';
import { useLang } from '../i18n/LanguageContext';

const ACCENT = 'var(--c-accent)';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Brand mark: a reticle. A ring, a center, and four ticks — an instrument,
 * not a seal.
 */
export const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    className={`brand-mark ${className}`}
    aria-hidden
  >
    <rect x="5" y="5" width="54" height="54" rx="16" stroke={ACCENT} strokeWidth="1.75" />
    <g className="logo-sweep">
      <circle cx="32" cy="32" r="12" stroke={ACCENT} strokeWidth="1.5" />
      <path d="M32 9v7M32 48v7M9 32h7M48 32h7" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round" />
    </g>
    <circle className="logo-dot" cx="32" cy="32" r="2.25" fill={ACCENT} />
  </svg>
);

interface BrandTitleProps {
  isLight?: boolean;
  compact?: boolean;
}

export const BrandTitle: React.FC<BrandTitleProps> = ({ isLight = false, compact = false }) => {
  const { lang, t } = useLang();
  return (
    <div className="min-w-0">
      <h1
        className={`brand-wordmark truncate ${compact ? 'text-base' : 'text-base sm:text-xl'}`}
        style={{ color: isLight ? '#0f172a' : '#ffffff' }}
      >
        trytellme
        <span style={{ color: ACCENT }}>.xyz</span>
      </h1>
      {!compact && (
        <p
          // Letter-spacing breaks Sinhala ligatures, so only track the Latin text.
          // Hidden on phones so the header tools fit beside the wordmark.
          className={`hidden sm:block text-[10px] font-mono ${lang === 'si' ? 'text-[11px]' : 'uppercase tracking-[0.22em]'}`}
          style={{ color: isLight ? 'rgba(var(--c-accent-rgb),0.70)' : 'rgba(255,255,255,0.45)' }}
        >
          {t('footer.tagline')}
        </p>
      )}
    </div>
  );
};

export const LogoFull: React.FC<{ iconSize?: number; className?: string }> = ({
  iconSize = 48,
  className = '',
}) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <Logo size={iconSize} className="shrink-0" />
    <BrandTitle />
  </div>
);
