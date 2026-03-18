// ── CORS ──────────────────────────────────────────────────────────────────────
export const CORS_ORIGINS = (process.env.CORS_ORIGINS?.split(',') ?? [
  'http://localhost:3000',
]).map((s) => s.trim());

export const CORS_CONFIG = {
  origin: CORS_ORIGINS,
  methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
};

// ── Frontend ──────────────────────────────────────────────────────────────────
export const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// ── Platform APIs ─────────────────────────────────────────────────────────────
export const TELEGRAM_API_BASE = 'https://api.telegram.org';

// ── Claude (Anthropic) ────────────────────────────────────────────────────────
export const CLAUDE_DEFAULTS = {
  model: 'claude-haiku-4-5',
  maxTokens: 1024,
} as const;

// ── Caching ───────────────────────────────────────────────────────────────────
export const SUGGESTIONS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
