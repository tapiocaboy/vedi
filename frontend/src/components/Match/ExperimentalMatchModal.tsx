import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ChevronRight } from 'lucide-react';
import { useLang } from '../../i18n/LanguageContext';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const ExperimentalMatchModal: React.FC<Props> = ({ visible, onDismiss }) => {
  const { t } = useLang();

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
            <div className="disclaimer-modal w-full max-w-2xl rounded-2xl overflow-hidden">
              <div className="h-[4px] bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 dark-stripe" />

              <div className="px-5 sm:px-9 pt-6 sm:pt-9 pb-5 sm:pb-6">
                <div className="flex items-center gap-4 mb-1">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl disclaimer-icon-wrap flex items-center justify-center shrink-0">
                    <FlaskConical className="w-5 h-5 sm:w-6 sm:h-6 disclaimer-icon" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-display font-bold disclaimer-text-primary">
                    {t('match.experimental.title')}
                  </h2>
                </div>
              </div>

              <div className="mx-5 sm:mx-9 h-px disclaimer-divider" />

              <div className="px-5 sm:px-9 py-5 sm:py-7 space-y-4">
                <div className="disclaimer-hero rounded-xl px-5 sm:px-7 py-5 sm:py-6">
                  <p className="text-base sm:text-lg font-semibold disclaimer-text-primary leading-snug">
                    {t('match.experimental.heroTitle')}
                  </p>
                  <p className="text-sm sm:text-base disclaimer-text-secondary mt-3 leading-relaxed">
                    {t('match.experimental.heroBody')}
                  </p>
                </div>
              </div>

              <div className="px-5 sm:px-9 pb-6 sm:pb-9">
                <button
                  onClick={onDismiss}
                  className="w-full flex items-center justify-center gap-2 py-4 px-5 rounded-xl font-semibold text-base transition-all duration-150 disclaimer-cta"
                >
                  {t('match.experimental.accept')}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
