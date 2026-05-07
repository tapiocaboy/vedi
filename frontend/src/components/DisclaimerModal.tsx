import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, ChevronRight } from 'lucide-react';

interface Props {
  visible: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<Props> = ({ visible, onAccept }) => {
  const accept = () => {
    onAccept();
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="disclaimer-modal w-full max-w-md rounded-2xl overflow-hidden">

              {/* Top stripe — thin, neutral */}
              <div className="h-[3px] bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400 dark-stripe" />

              {/* Header */}
              <div className="px-7 pt-7 pb-5">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl disclaimer-icon-wrap flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4.5 h-4.5 disclaimer-icon" />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold disclaimer-text-primary">
                      Before You Continue
                    </h2>
                  </div>
                </div>
              </div>

              <div className="mx-7 h-px disclaimer-divider" />

              {/* Body */}
              <div className="px-7 py-5 space-y-4">

                {/* Hero message */}
                <div className="disclaimer-hero rounded-xl px-5 py-4">
                  <p className="text-sm font-semibold disclaimer-text-primary leading-snug">
                    Your future is not written in the stars.
                  </p>
                  <p className="text-sm disclaimer-text-secondary mt-1.5 leading-relaxed">
                    You are the author of your own life. No prediction system — including this one — can determine who you are or what you will become.
                  </p>
                </div>

                {/* Points */}
                <ul className="space-y-3">
                  {[
                    { label: 'For curiosity & self-reflection only', body: 'These charts are based on astronomical calculations. They are not guidance for real decisions.' },
                    { label: 'Your choices define your path', body: 'Hard work, relationships, and resilience shape your life — not planetary periods.' },
                    { label: 'Not professional advice', body: 'Nothing here replaces medical, financial, psychological, or legal counsel.' },
                  ].map(({ label, body }) => (
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

              {/* Footer */}
              <div className="px-7 pb-7">
                <button
                  onClick={accept}
                  className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-semibold text-sm transition-all duration-150 disclaimer-cta"
                >
                  I understand — continue
                  <ChevronRight className="w-4 h-4" />
                </button>
                <p className="text-center text-xs disclaimer-text-muted mt-3">
                  This notice will not appear again on this device.
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
