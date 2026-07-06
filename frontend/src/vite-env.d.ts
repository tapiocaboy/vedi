/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** NVIDIA API key for the horoscope chat (NVIDIA Nemotron). */
  readonly NVIDIA_API_KEY?: string;
  /** Optional model slug override. Defaults to the Nemotron Ultra model. */
  readonly NVIDIA_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  /** Google Analytics gtag, defined inline in index.html. */
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
}
