import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<Props> = ({ visible, onAccept }) => {
  const { t } = useLang();

  const points = [
    { label: t('disclaimer.point1.label'), body: t('disclaimer.point1.body') },
    { label: t('disclaimer.point2.label'), body: t('disclaimer.point2.body') },
    { label: t('disclaimer.point3.label'), body: t('disclaimer.point3.body') },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="disclaimer-modal w-full max-w-md rounded-2xl overflow-hidden">
              <div className="h-[3px] bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 dark-stripe" />

              <div className="px-7 pt-7 pb-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl disclaimer-icon-wrap flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4.5 h-4.5 disclaimer-icon" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold disclaimer-text-primary">
                      {t('disclaimer.title')}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="mx-7 h-px disclaimer-divider" />

              <div className="px-7 py-5 space-y-4">
                <div className="disclaimer-hero rounded-xl px-5 py-4">
                  <p className="text-sm font-semibold disclaimer-text-primary leading-snug">
                    {t('disclaimer.heroTitle')}
                  </p>
                  <p className="text-sm disclaimer-text-secondary mt-1.5 leading-relaxed">
                    {t('disclaimer.heroBody')}
                  </p>
                </div>

                <ul className="space-y-3">
                  {points.map(({ label, body }) => (
                    <li key={label} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 disclaimer-dot" />
                      <div>
                        <p className="text-sm font-semibold disclaimer-text-primary">{label}</p>
                        <p className="text-xs disclaimer-text-muted mt-0.5 leading-relaxed">{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-7 pb-7">
                <button
                  onClick={onAccept}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-150 disclaimer-cta"
                >
                  {t('disclaimer.accept')}
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs disclaimer-text-muted mt-3">
                  {t('disclaimer.acceptNote')}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DisclaimerModal;
