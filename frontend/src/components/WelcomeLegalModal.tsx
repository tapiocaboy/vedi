import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, ChevronRight, ExternalLink } from 'lucide-react';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

const REPO = 'https://github.com/tapiocaboy/vedi/blob/main';

/**
 * Legal gate shown on every site load / refresh / first visit.
 * Presents the entertainment-only disclaimer, a brief Terms of Service,
 * and a liability waiver. The user must accept to continue.
 */
export const WelcomeLegalModal: React.FC<Props> = ({ visible, onAccept }) => {
  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="welcome-bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm"
          />

          {/* Modal */}
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

              {/* Top stripe */}
              <div className="h-[3px] bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 dark-stripe shrink-0" />

              {/* Header */}
              <div className="px-7 pt-7 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl disclaimer-icon-wrap flex items-center justify-center shrink-0">
                    <ScrollText className="w-4.5 h-4.5 disclaimer-icon" />
                  </div>
                  <div>
                    <h2 id="welcome-legal-title" className="text-lg font-display font-bold disclaimer-text-primary">
                      Please Read Before Continuing
                    </h2>
                    <p className="text-xs disclaimer-text-muted mt-0.5">
                      Disclaimer · Terms of Service · Liability Waiver
                    </p>
                  </div>
                </div>
              </div>

              <div className="mx-7 h-px disclaimer-divider shrink-0" />

              {/* Scrollable body */}
              <div className="px-7 py-5 space-y-4 overflow-y-auto">

                {/* Hero — entertainment only */}
                <div className="disclaimer-hero rounded-xl px-5 py-4">
                  <p className="text-sm font-semibold disclaimer-text-primary leading-snug">
                    For entertainment &amp; informational purposes only.
                  </p>
                  <p className="text-sm disclaimer-text-secondary mt-1.5 leading-relaxed">
                    Vedi generates astrological charts from astronomical
                    calculations. The output is <strong>not</strong> medical, legal,
                    financial, or psychological advice, and must not be used as a
                    substitute for professional consultation.
                  </p>
                </div>

                {/* Key terms */}
                <div className="space-y-3">
                  {[
                    {
                      label: 'Not professional advice',
                      body: 'Never use this tool to make medical, legal, financial, psychological, or other important life decisions. Always consult a qualified professional.',
                    },
                    {
                      label: 'No guarantees — provided “as is”',
                      body: 'Astrology is not scientifically validated. Calculations may contain errors. We make no warranty as to accuracy, reliability, or fitness for any purpose.',
                    },
                    {
                      label: 'Limitation of liability & waiver',
                      body: 'You use this service at your own risk. To the fullest extent permitted by law, the creators are not liable for any loss, damage, or decision arising from your use of it, and you waive any such claims.',
                    },
                    {
                      label: 'Your data stays private',
                      body: 'All calculations run locally in your browser. We do not collect, store, or transmit the birth details you enter.',
                    },
                  ].map(({ label, body }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0 disclaimer-dot" />
                      <div>
                        <p className="text-sm font-semibold disclaimer-text-primary">{label}</p>
                        <p className="text-xs disclaimer-text-muted mt-0.5 leading-relaxed">{body}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Links to full docs */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                  <a
                    href={`${REPO}/TERMS.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold disclaimer-text-secondary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Full Terms of Service
                  </a>
                  <a
                    href={`${REPO}/PRIVACY.md`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold disclaimer-text-secondary hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Privacy Policy
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 pb-7 pt-2 shrink-0">
                <button
                  onClick={onAccept}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-150 disclaimer-cta"
                >
                  I have read and agree — continue
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs disclaimer-text-muted mt-3">
                  By continuing you accept the Terms of Service and acknowledge this disclaimer.
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
