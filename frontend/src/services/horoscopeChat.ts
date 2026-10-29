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
// nemotron-3-super-120b-a12b was retired on the free endpoint (HTTP 404).
// 3.5 Super VL is the hosted replacement and still answers with thinking off.
// Override with NVIDIA_MODEL if desired.
const DEFAULT_MODEL = 'nvidia/nemotron-3.5-super-vl-120b-a12b';

export function getChatModel(): string {
  return import.meta.env.NVIDIA_MODEL || DEFAULT_MODEL;
}

export function getChatApiKey(): string | undefined {
  return import.meta.env.NVIDIA_API_KEY;
}

export function isChatConfigured(): boolean {
  return !!getChatApiKey()?.trim();
}

/**
 * The divisional charts the export always includes. Used both to brief the
 * model and to tell the user, at the start of a chat, what can be asked about.
 */
export const DIVISIONAL_INDEX: Array<{ code: string; plain: string; question: string }> = [
  { code: 'D1',  plain: 'Main chart',          question: 'the whole life at a glance' },
  { code: 'D2',  plain: 'Money',               question: 'how money behaves in your life' },
  { code: 'D3',  plain: 'Siblings & courage',  question: 'your drive, and siblings and peers' },
  { code: 'D4',  plain: 'Home & property',     question: 'the home, land and security you build' },
  { code: 'D7',  plain: 'Children',            question: 'children and what you create' },
  { code: 'D9',  plain: 'Marriage',            question: 'marriage, the spouse, and inner strength' },
  { code: 'D10', plain: 'Career',              question: 'career, status and public standing' },
  { code: 'D12', plain: 'Parents & ancestry',  question: 'what your parents and lineage passed on' },
  { code: 'D24', plain: 'Learning',            question: 'how you learn and how far study takes you' },
  { code: 'D30', plain: 'Weak spots',          question: 'where trouble is most likely to find you' },
  { code: 'D60', plain: 'Deep karma',          question: 'the pattern running beneath everything' },
];

/** Build the system prompt that grounds the model in this person's chart. */
export function buildSystemPrompt(chartMarkdown: string): string {
  return [
    'You are a warm, clear guide. You understand this person\'s birth chart, and you always speak to an ordinary person.',
    "You are given ONE specific person's birth chart below, exported as Markdown. Use it only as private notes.",
    'Reason from the planet signs and houses, the Moon nakshatra, the running dashas, and ALL the divisional charts',
    'included below. Every divisional chart carries its own verdict, its key planet, a plain-language',
    'meaning for each of its twelve houses, and a per-planet reading — use those rather than generic house',
    'meanings, because a house means something different in each chart (the 5th is children in D7, exam',
    'ability in D24, and recklessness in D30). Never repeat those mechanics in the reply.',
    '',
    'The divisional charts available to you, for your reasoning only:',
    ...DIVISIONAL_INDEX.map(d => `  - ${d.code} (${d.plain}) — ${d.question}`),
    'A "Knowledge Graph — Current Period" section is also included. Use it privately for "right now" questions:',
    'what is active, how strong it is, which parts of life it touches, and what needs attention.',
    '',
    'How to write every reply:',
    '- Always write for an ordinary person who has never studied astrology.',
    '- Do not explain planetary positions. Do not name planets, signs, houses, nakshatras, padas, dashas, yogas, doshas, or chart codes such as D1 or D10.',
    '- Do not explain astrological information: no lessons on how a placement, house, or period produces a result, and no technical terms.',
    '- Say what it means in daily life — work, money, home, love, health, family, study — and, when timing matters, the month and year only.',
    '- If the user asks where a planet sits or what a chart code means, answer with the life result only.',
    '- Stay strictly within THIS person\'s life. If asked about anything unrelated (general knowledge, coding, other people, current events), politely decline and steer the conversation back to their life.',
    '- Base every statement only on the chart data provided. Never invent events, dates, or periods that are not supported by it.',
    '- For "current period" / "right now" / "this year" questions, lead with what is happening in their life now and what needs attention.',
    '- For area-specific questions, read the matching divisional chart (D2 for money, D7 for children, D10 for career, D24 for learning) alongside the main chart. Use its verdict privately. Do not name the chart or its key planet.',
    '- Note privately that D30 is inverted: strength there means better resistance to trouble, not more trouble. Describe the life effect only.',
    '- Be encouraging and balanced; never fatalistic. These are tendencies, not certainties.',
    '- If something cannot be determined from the given data, say so in plain words rather than inventing it.',
    '- Keep answers focused and well-structured; use short paragraphs or bullets.',
    '- Keep each reply self-contained and complete, and ALWAYS finish your final sentence rather than trailing off.',
    '- Default to British English (e.g. "colour", "realise", "favourable"). When replying in English, do NOT use Hindi or Sanskrit greetings such as "Namaste".',
    '- Language scope: you MAY reply entirely in Sinhala, Hindi, Tamil, or Chinese instead if the user writes in, or explicitly asks for, one of those languages. Translate the life meaning faithfully. Do not add technical terms. Do not switch language unless asked.',
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
