import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, AlertTriangle, KeyRound, MessageCircle } from 'lucide-react';
import type { Chart } from '../../types/astrology';
import { buildChartMarkdown } from '../../lib/core/exportChart';
import {
  askHoroscope, buildSystemPrompt, isChatConfigured, getChatModel,
  type ChatMessage,
} from '../../services/horoscopeChat';
import { useLang } from '../../i18n/LanguageContext';
import { Markdown } from './Markdown';

interface Props {
  visible: boolean;
  onClose: () => void;
  chart: Chart | null;
}

interface UiMessage { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  'What are my biggest strengths in this chart?',
  'What does my current dasha period mean for me?',
  'When is a favourable time for career growth?',
  'What does my Moon nakshatra say about me?',
];

export const HoroscopeChat: React.FC<Props> = ({ visible, onClose, chart }) => {
  const { t } = useLang();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const configured = isChatConfigured();
  const systemPrompt = useMemo(
    () => (chart ? buildSystemPrompt(buildChartMarkdown(chart)) : ''),
    [chart],
  );

  // Auto-scroll to the newest content.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  // Stop any in-flight request when the panel closes.
  useEffect(() => {
    if (!visible) abortRef.current?.abort();
  }, [visible]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || busy || !chart || !configured) return;
    setError(null);
    setInput('');

    const history: UiMessage[] = [...messages, { role: 'user', content: question }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setBusy(true);

    const apiMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content })),
    ];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const answer = await askHoroscope(apiMessages, controller.signal);
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === 'assistant') next[next.length - 1] = { ...last, content: answer.trim() };
        return next;
      });
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      const msg = (e as Error).message;
      setError(
        msg === 'NO_API_KEY' ? t('chat.notConfigured')
          : msg === 'TIMEOUT' ? t('chat.timeout')
          : `${t('chat.error')} (${msg})`,
      );
      // Drop the empty assistant bubble on failure.
      setMessages(prev => prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'assistant' && m.content === '')));
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            className="fixed inset-0 z-[65] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 bottom-0 z-[66] w-full sm:w-[420px] glass-card border-l border-white/10 flex flex-col"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/8 shrink-0">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'rgba(var(--c-accent-rgb),0.10)', border: '1px solid rgba(var(--c-accent-rgb),0.22)' }}>
                <MessageCircle className="w-4.5 h-4.5" style={{ color: 'var(--c-accent)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white">{t('chat.title')}</h3>
                <p className="text-[11px] text-white/45 truncate">{t('chat.subtitle')}</p>
              </div>
              <button onClick={onClose} aria-label={t('monthly.close')}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/8 transition-colors shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            {!chart ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-6">
                <AlertTriangle className="w-7 h-7 text-amber-300/70" />
                <p className="text-sm text-white/65 max-w-xs leading-relaxed">{t('chat.needChart')}</p>
              </div>
            ) : !configured ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-6">
                <KeyRound className="w-7 h-7 text-amber-300/70" />
                <p className="text-sm text-white/70 max-w-xs leading-relaxed">{t('chat.notConfigured')}</p>
                <code className="text-[11px] font-mono text-white/50 bg-black/40 border border-white/10 rounded-md px-2 py-1">
                  NVIDIA_API_KEY=…
                </code>
              </div>
            ) : (
              <>
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* Greeting */}
                  <div className="rounded-xl border border-white/8 bg-black/30 p-3">
                    <p className="text-[12px] text-white/75 leading-relaxed">{t('chat.greeting')}</p>
                  </div>

                  {messages.length === 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase tracking-wider text-white/35 px-1">{t('chat.trySuggestions')}</div>
                      {SUGGESTIONS.map(s => (
                        <button key={s} onClick={() => send(s)}
                          className="w-full text-left text-[12px] text-white/70 rounded-lg border border-white/8 bg-white/3 px-3 py-2 hover:bg-white/6 hover:text-white transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {messages.map((m, i) => {
                    const isWaiting = busy && i === messages.length - 1 && m.role === 'assistant' && !m.content;
                    return (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed ${
                          m.role === 'user'
                            ? 'text-white rounded-br-md whitespace-pre-wrap'
                            : 'bg-white/5 border border-white/8 text-white/85 rounded-bl-md'
                        }`}
                          style={m.role === 'user' ? { backgroundColor: 'var(--c-accent)' } : undefined}
                        >
                          {m.content
                            ? (m.role === 'assistant' ? <Markdown content={m.content} /> : m.content)
                            : isWaiting
                              ? <span className="inline-flex items-center gap-1.5 text-white/50"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('chat.thinking')}</span>
                              : ''}
                        </div>
                      </div>
                    );
                  })}

                  {error && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-3 text-[12px] text-rose-200 leading-relaxed flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> <span>{error}</span>
                    </div>
                  )}
                </div>

                {/* Composer */}
                <div className="p-3 border-t border-white/8 shrink-0">
                  <form
                    onSubmit={(e) => { e.preventDefault(); send(input); }}
                    className="flex items-end gap-2"
                  >
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                      rows={1}
                      placeholder={t('chat.placeholder')}
                      className="flex-1 resize-none bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-[rgba(var(--c-accent-rgb),0.5)] max-h-28"
                    />
                    <button
                      type="submit"
                      disabled={busy || !input.trim()}
                      aria-label={t('chat.send')}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 disabled:opacity-40 transition-opacity"
                      style={{ backgroundColor: 'var(--c-accent)' }}
                    >
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                  <div className="flex items-center gap-1.5 mt-1.5 px-1">
                    <Sparkles className="w-3 h-3 text-white/30" />
                    <span className="text-[9px] font-mono text-white/30 truncate">{t('chat.poweredBy')} · {getChatModel()}</span>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
