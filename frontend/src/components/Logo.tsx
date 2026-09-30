import React from 'react';
import { useLang } from '../i18n/LanguageContext';

const PINK = 'var(--c-accent)';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Brand mark: the birth chart reduced to a diamond seal, with the native at the center.
 * Symmetric, so it stays a mark rather than a figure.
 */
export const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    className={className}
    aria-hidden
  >
    <rect width="64" height="64" rx="16" fill={PINK} />
    <path
      d="M32 13L51 32L32 51L13 32Z"
      stroke="white"
      strokeWidth="5.25"
      strokeLinejoin="round"
    />
    <circle cx="32" cy="32" r="3.15" fill="white" />
  </svg>
);

interface BrandTitleProps {
  isLight?: boolean;
  compact?: boolean;
}

export const BrandTitle: React.FC<BrandTitleProps> = ({ isLight = false, compact = false }) => {
  const { lang, t } = useLang();
  return (
    <div>
      <h1
        className={`brand-wordmark ${compact ? 'text-base' : 'text-lg sm:text-xl'}`}
        style={{ color: isLight ? '#0f172a' : '#ffffff' }}
      >
        trytellme
        <span style={{ color: PINK }}>.xyz</span>
      </h1>
      {!compact && (
        <p
          // Letter-spacing breaks Sinhala ligatures, so only track the Latin text
          className={`text-[10px] font-mono ${lang === 'si' ? 'text-[11px]' : 'uppercase tracking-[0.22em]'}`}
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
