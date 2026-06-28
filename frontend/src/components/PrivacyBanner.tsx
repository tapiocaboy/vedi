import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  /** When true shows a slightly different message (on generate click) */
  trigger?: 'load' | 'generate';
}

const AUTO_DISMISS_MS = 6000;

export const PrivacyBanner: React.FC<Props> = ({
  visible,
  onDismiss,
  trigger = 'load',
}) => {
  const { t } = useLang();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(onDismiss, AUTO_DISMISS_MS);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (trigger === 'generate' ? (
        // ── Large centered popup, shown when the user clicks Generate ──────────
        <motion.div
          key="privacy-modal"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onDismiss} />

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="privacy-banner pointer-events-auto relative w-full max-w-xl rounded-2xl px-7 py-9 sm:px-12 sm:py-12 text-center"
          >
            <button
              onClick={onDismiss}
              className="absolute top-3 right-3 privacy-close rounded-lg p-2 transition-colors"
              aria-label={t('privacy.dismiss')}
            >
              <X className="w-5 h-5" />
            </button>

            <div
              className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.30)' }}
            >
              <ShieldCheck className="w-11 h-11 privacy-icon" />
            </div>

            <h2 className="privacy-title text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
              {t('privacy.title')}
            </h2>
            <p className="privacy-strong text-lg sm:text-xl font-bold leading-relaxed max-w-lg mx-auto">
              {t('privacy.bodyGenerate')}
            </p>

            <button
              onClick={onDismiss}
              className="on-accent mt-8 inline-flex items-center justify-center px-10 py-3.5 rounded-xl text-white text-lg font-bold transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: 'var(--c-accent)' }}
            >
              {t('privacy.continue')}
            </button>

            <div
              className="absolute bottom-0 left-0 h-1.5 privacy-progress rounded-b-2xl"
              style={{ animation: 'privacy-shrink 6s linear forwards' }}
            />
          </motion.div>
        </motion.div>
      ) : (
        // ── Passive top banner, shown on initial load ─────────────────────────
        <motion.div
          key="privacy-banner"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="fixed top-[72px] left-0 right-0 z-40 flex justify-center px-4 pointer-events-none"
        >
          <div className="privacy-banner pointer-events-auto flex items-start gap-3 px-5 py-3.5 rounded-xl shadow-lg max-w-xl w-full">
            <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 privacy-icon" />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold privacy-title">
                {t('privacy.title')}
              </p>
              <p className="text-xs privacy-body mt-0.5 leading-relaxed">
                {t('privacy.bodyLoad')}
              </p>
            </div>

            <div className="absolute bottom-0 left-0 h-[2px] privacy-progress rounded-b-xl"
              style={{ animation: 'privacy-shrink 6s linear forwards' }}
            />

            <button
              onClick={onDismiss}
              className="shrink-0 privacy-close rounded-lg p-1 transition-colors"
              aria-label={t('privacy.dismiss')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default PrivacyBanner;
