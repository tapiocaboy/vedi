import React, { useId } from 'react';
import { useLang } from '../i18n/LanguageContext';

const PINK = '#FF2E51';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = '' }) => {
  const uid = useId().replace(/:/g, '');
  const glowId = `g-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <defs>
        <radialGradient id={glowId} cx="32" cy="32" r="32" gradientUnits="userSpaceOnUse">
          <stop stopColor={PINK} stopOpacity="0.18" />
          <stop offset="1" stopColor={PINK} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Pink rounded square */}
      <rect width="64" height="64" rx="16" fill={PINK} />
      <circle cx="32" cy="32" r="28" fill={`url(#${glowId})`} />

      {/* Crescent moon — white */}
      <path
        d="M22 18a12 12 0 1 0 0 24 9 9 0 1 1 0-24z"
        fill="white"
      />

      {/* Star — white, clean geometry */}
      <path
        d="M40 22l2 6.2h6.5l-5.25 3.8 2 6.2L40 34.4l-5.25 3.8 2-6.2-5.25-3.8H38z"
        fill="white"
      />

      {/* Small sparkles */}
      <circle cx="52" cy="14" r="2" fill="white" opacity="0.9" />
      <circle cx="50" cy="48" r="1.5" fill="white" opacity="0.6" />
      <circle cx="14" cy="50" r="1" fill="white" opacity="0.5" />
    </svg>
  );
};

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
          style={{ color: isLight ? 'rgba(255,46,81,0.70)' : 'rgba(255,255,255,0.45)' }}
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
