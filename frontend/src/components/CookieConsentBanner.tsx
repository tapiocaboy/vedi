import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

interface Props {
  visible: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const CookieConsentBanner: React.FC<Props> = ({ visible, onAccept, onDecline }) => {
  const { t } = useLang();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
          role="dialog"
          aria-label={t('cookies.title')}
        >
          <div className="privacy-banner pointer-events-auto px-5 py-4 rounded-xl shadow-lg max-w-xl w-full">
            <div className="flex items-start gap-3">
              <Cookie className="w-4 h-4 mt-0.5 shrink-0 cookie-icon" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold privacy-title">
                  {t('cookies.title')}
                </p>
                <p className="text-xs privacy-body mt-0.5 leading-relaxed">
                  {t('cookies.body')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-3">
              <button
                onClick={onDecline}
                className="cookie-decline text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {t('cookies.decline')}
              </button>
              <button
                onClick={onAccept}
                className="disclaimer-cta text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {t('cookies.accept')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsentBanner;
