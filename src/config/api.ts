/**
 * Single source of truth for the backend base URL.
 *
 * Local dev: falls back to localhost:8082 automatically.
 * Production (Vercel build): set VITE_API_BASE_URL in .env.production
 * or in the Vercel project's Environment Variables — Vite bakes it in
 * at build time, so it must be set before/during the build, not
 * changed at runtime.
 *
 * Every service file builds its own endpoint path off of this:
 *   `${API_BASE_URL}/v1/api/xmlvalidate`
 *   `${API_BASE_URL}/v1/api/message-summary`
 *   `${API_BASE_URL}/v1/api/whatever-comes-next`
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8082";