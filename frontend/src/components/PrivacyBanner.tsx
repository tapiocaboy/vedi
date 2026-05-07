import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  /** When true shows a slightly different message (on generate click) */
  trigger?: 'load' | 'generate';
}

export const PrivacyBanner: React.FC<Props> = ({
  visible,
  onDismiss,
  trigger = 'load',
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(onDismiss, 6000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
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
                Your data stays on your device
              </p>
              <p className="text-xs privacy-body mt-0.5 leading-relaxed">
                {trigger === 'generate'
                  ? 'All calculations happen locally in your browser. Nothing you enter is sent to any server or stored anywhere.'
                  : 'This tool runs entirely in your browser. We do not collect, store, or transmit any information you enter — ever.'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-[2px] privacy-progress rounded-b-xl"
              style={{ animation: 'privacy-shrink 6s linear forwards' }}
            />

            <button
              onClick={onDismiss}
              className="shrink-0 privacy-close rounded-lg p-1 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrivacyBanner;
