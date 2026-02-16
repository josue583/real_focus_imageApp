/**
 * Backend URL for API and uploads.
 * - In dev: empty so Vite proxy sends /api and /uploads to localhost:5000.
 * - In production (Vercel): use VITE_API_BASE_URL if set, else the fallback below.
 * Replace the URL below with your real Render backend URL (no trailing slash), then push.
 */
const RENDER_BACKEND_URL = 'https://real-focus-image-backend.onrender.com'

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? RENDER_BACKEND_URL : '')
export const API = API_BASE + '/api'
