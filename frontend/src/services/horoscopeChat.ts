/**
 * Horoscope chat — talks to NVIDIA Nemotron via the NVIDIA Integrate API
 * (https://integrate.api.nvidia.com/v1), which is OpenAI-compatible.
 *
 * The API key is read from the Vite env (`NVIDIA_API_KEY`, exposed via the
 * `envPrefix` in vite.config.ts). NOTE: in a pure client-side build this key is
 * bundled into the shipped JS and is therefore visible to anyone who inspects
 * the app. For production, front this with a serverless proxy that holds the
 * key. It is wired client-side here because the brief asked for the key to come
 * from `.env`. (The NVIDIA endpoint may also reject browser requests via CORS —
 * a proxy solves that too.)
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// In dev we call the same-origin Vite proxy (which injects the key and avoids
// CORS); a direct call is the fallback for any non-dev/static hosting.
const PROXY_URL = '/nv-api/v1/chat/completions';
const DIRECT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const NVIDIA_URL = import.meta.env.DEV ? PROXY_URL : DIRECT_URL;
// The ultra-550b model times out on the hosted endpoint (>150s); super-120b
// returns correct answers in ~1–2s. Override with VITE/NVIDIA_MODEL if desired.
const DEFAULT_MODEL = 'nvidia/nemotron-3-super-120b-a12b';

export function getChatModel(): string {
  return import.meta.env.NVIDIA_MODEL || DEFAULT_MODEL;
}

export function getChatApiKey(): string | undefined {
  return import.meta.env.NVIDIA_API_KEY;
}

export function isChatConfigured(): boolean {
  return !!getChatApiKey();
}

/** Build the system prompt that grounds the model in this person's chart. */
export function buildSystemPrompt(chartMarkdown: string): string {
  return [
    'You are an expert Vedic (sidereal / Jyotisha) astrologer and a warm, clear teacher.',
    "You are given ONE specific person's birth chart below, exported as Markdown.",
    "Answer the user's questions about THIS chart only, grounding every statement in the data provided:",
    'planet signs and houses, the Moon nakshatra, the running dashas, and ALL the divisional (varga) charts',
    'included below — D2 (wealth), D3 (siblings), D4 (property), D7 (children), D9 (marriage/dharma),',
    'D10 (career), D12 (parents), D24 (education), D30 (adversity) and D60 (overall karma).',
    '',
    'Guidelines:',
    '- Stay strictly within the context of THIS chart and Vedic astrology. If asked about anything unrelated (general knowledge, coding, other people, current events, non-astrological topics), politely decline and steer the conversation back to the chart.',
    '- Base every statement only on the chart data provided above. Never invent placements, dates, or periods that are not shown in it.',
    '- Be concrete and reference the actual placements (e.g. "your Moon in ... house ...").',
    '- Explain jargon briefly so a layperson understands.',
    '- When timing is asked, reason from the dasha periods and note them by date.',
    '- For area-specific questions, read the matching divisional chart (e.g. D2 for wealth, D7 for children, D10 for career, D24 for education) alongside the main chart, not just D1.',
    '- Be encouraging and balanced; never fatalistic. Astrology shows tendencies, not certainties.',
    '- If something cannot be determined from the given data, say so rather than inventing it.',
    '- Keep answers focused and well-structured; use short paragraphs or bullets.',
    '- Keep each reply self-contained and complete, and ALWAYS finish your final sentence rather than trailing off.',
    '- Default to British English (e.g. "colour", "realise", "favourable"). When replying in English, do NOT use Hindi or Sanskrit greetings such as "Namaste".',
    '- Language scope: you MAY reply entirely in Sinhala, Hindi, Tamil, or Chinese instead if the user writes in, or explicitly asks for, one of those languages. Translate the reading faithfully and keep the astrological meaning and any technical terms accurate. Do not switch language unless asked.',
    '',
    '--- BIRTH CHART (Markdown) ---',
    chartMarkdown,
    '--- END BIRTH CHART ---',
  ].join('\n');
}

/**
 * Ask the model a question and resolve with the full answer text.
 *
 * Uses a non-streaming request with thinking disabled: the 550B model's
 * first-token latency is high and streaming buffers through the dev proxy, so a
 * single non-streamed reply (typically ~15–25s) is the most reliable path.
 */
const REQUEST_TIMEOUT_MS = 100_000;

export async function askHoroscope(
  messages: ChatMessage[],
  signal?: AbortSignal,
): Promise<string> {
  const key = getChatApiKey();
  if (!key) throw new Error('NO_API_KEY');

  // Abort on either the caller's signal or our own safety timeout, so a slow
  // request fails gracefully instead of hanging the chat forever.
  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener('abort', onAbort);
  }
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; ctrl.abort(); }, REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(NVIDIA_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: getChatModel(),
        messages,
        temperature: 0.7,
        top_p: 0.95,
        // Plenty of headroom so answers never get cut off; the prompt asks the
        // model to finish naturally, so it rarely uses the full budget.
        max_tokens: 8192,
        // Keep answers prompt and on-topic — no long internal reasoning pass.
        chat_template_kwargs: { enable_thinking: false },
        stream: false,
      }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`NVIDIA API error ${res.status}: ${text.slice(0, 300)}`);
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content ?? '';
  } catch (e) {
    if (timedOut) throw new Error('TIMEOUT');
    throw e;
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}
