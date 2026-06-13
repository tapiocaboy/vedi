import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, ChevronRight, ExternalLink } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

const REPO = 'https://github.com/tapiocaboy/vedi/blob/main';

export const WelcomeLegalModal: React.FC<Props> = ({ visible, onAccept }) => {
  const { t } = useLang();

  const points = [
    { label: t('legal.welcome.point1.label'), body: t('legal.welcome.point1.body') },
    { label: t('legal.welcome.point2.label'), body: t('legal.welcome.point2.body') },
    { label: t('legal.welcome.point3.label'), body: t('legal.welcome.point3.body') },
    { label: t('legal.welcome.point4.label'), body: t('legal.welcome.point4.body') },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="welcome-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm"
          />

          <motion.div
            key="welcome-modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-legal-title"
          >
            <div className="disclaimer-modal w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl overflow-hidden">
              <div className="h-[3px] bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 dark-stripe shrink-0" />

              <div className="px-7 pt-7 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl disclaimer-icon-wrap flex items-center justify-center shrink-0">
                    <ScrollText className="w-4.5 h-4.5 disclaimer-icon" />
                  </div>
                  <div>
                    <h2 id="welcome-legal-title" className="text-lg font-display font-bold disclaimer-text-primary">
                      {t('legal.welcome.title')}
                    </h2>
                    <p className="text-xs disclaimer-text-muted mt-0.5">
                      {t('legal.welcome.subtitle')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-7 h-px disclaimer-divider shrink-0" />

              <div className="px-7 py-5 space-y-4 overflow-y-auto">
                <div className="disclaimer-hero rounded-xl px-5 py-4">
                  <p className="text-sm font-semibold disclaimer-text-primary leading-snug">
                    {t('legal.welcome.heroTitle')}
                  </p>
                  <p className="text-sm disclaimer-text-secondary mt-1.5 leading-relaxed">
                    {t('legal.welcome.heroBody')}
                  </p>
                </div>

                <div className="space-y-3">
                  {points.map(({ label, body }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 disclaimer-dot" />
                      <div>
                        <p className="text-sm font-semibold disclaimer-text-primary">{label}</p>
                        <p className="text-xs disclaimer-text-muted mt-0.5 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                  <a
                    href={`${REPO}/TERMS.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold disclaimer-text-secondary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t('legal.welcome.termsLink')}
                  </a>
                  <a
                    href={`${REPO}/PRIVACY.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold disclaimer-text-secondary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {t('legal.welcome.privacyLink')}
                  </a>
                </div>
              </div>

              <div className="px-7 pb-7 pt-2 shrink-0">
                <button
                  onClick={onAccept}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-150 disclaimer-cta"
                >
                  {t('legal.welcome.accept')}
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs disclaimer-text-muted mt-3">
                  {t('legal.welcome.acceptNote')}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WelcomeLegalModal;
