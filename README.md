# Webpage_mvp (VisionTech Frontend)

VisionTech’s web experience built with Vite + React. It showcases the product story, routes users through onboarding, and connects to the platform backend for authentication.

## Stack
- Vite + React 19, TypeScript
- Tailwind (via twin CSS classes) & Motion for animations
- react-router-dom 7 for routing
- lucide-react icons
- Supabase JS client (ready for future direct use)

## App Structure
- `src/pages/Home.tsx` — marketing hero, solution overview, how-it-works, FAQs, CTA.
- `src/pages/About.tsx` — story, vision/mission, problem, values, team (with LinkedIn links).
- `src/pages/login.tsx` — real login flow calling backend `/auth/login`.
- `src/pages/signup.tsx` — real signup flow calling backend `/auth/register`.
- `src/pages/Onboarding.tsx`, `Workspace.tsx`, `Network.tsx`, `Admin.tsx` — product shells/demos.
- `src/components/Layout.tsx` — header (desktop + mobile menu) and footer.
- `src/lib/api.ts` — thin HTTP client to backend; prefers httpOnly cookies and only keeps non-sensitive user data in sessionStorage.
- `src/lib/supabaseClient.ts` — Supabase client factory (not yet wired into UI).

## Environment
Create `.env.local` in the project root:
```
VITE_API_BASE_URL=http://localhost:8000      # Backend base URL (FastAPI YTE-Platform)
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
```
Production tip: set `VITE_API_BASE_URL` to your HTTPS endpoint (see `.env.production`).
Notes:
- `login`/`signup` use `VITE_API_BASE_URL` and talk to the backend’s `/auth/login` and `/auth/register` (the backend then talks to Supabase).
- Supabase client is available for future direct calls; keep URL/key in sync with backend env.

## Running Locally
1) Install deps: `npm install`
2) Start dev server: `npm run dev` (default on port 3000)
3) Lint/typecheck: `npm run lint` (tsc --noEmit)
4) Tests: `npm test` (Vitest + jsdom)

## Auth & Profile Flow (current)
The backend is the source of truth for auth and onboarding/profile state.

- Login / Signup: `/auth/login`, `/auth/register`
- Profile fetch: `GET /me/profile`
- Onboarding upsert: `PUT /me/profile/onboarding`

Frontend behaviour:
- `AuthContext` bootstraps `/auth/me` then `/me/profile`
- Route guards, login redirects, and dashboard personalization all rely on backend `is_onboarding_complete`
- `sessionStorage` is now cache-only (not the source of truth) for onboarding/profile
- Signup: POST `/auth/register` with email/password/display_name/etc. Success stores `access_token` (if returned) and redirects to `/workspace`.
- Login: POST `/auth/login` with email/password. Success stores `access_token` (if returned) and redirects to `/dashboard`.
- Tokens are **not** persisted client-side; the client assumes secure httpOnly cookies are set by the backend. Only the user profile is cached in `sessionStorage`. All requests send `credentials: include` for cookie-based sessions.

## Routing Highlights
- Home hero CTAs: Join VisionTech → `/signup`; Get Started → `/intelligence`; Meet the Team → `/about#team`.
- About “Problem” anchor is `#problem` for deep-links.
 - Mobile nav toggles via hamburger; login/signup buttons now appear from the `md` breakpoint upward (previously hidden until `lg`).
 - Forgot password page lives at `/forgot-password` (currently emails support).
 
 ## Folder Layout (key)
- `src/pages/*` — page-level views
- `src/components/*` — layout and shared UI
- `src/lib/api.ts` — backend client
- `src/lib/supabaseClient.ts` — Supabase client
- `public/` — static assets

## Backend Expectations (YTE-Platform)
- Environment: `YTE_SUPABASE_URL`, `YTE_SUPABASE_PUBLISHABLE_KEY` (or anon), `YTE_AUTH_PROVIDER=supabase`.
- Endpoints used: `/auth/register`, `/auth/login`; add `/auth/me` for session checks.

## Deployment Notes
- Ensure `VITE_API_BASE_URL` points to your deployed backend.
- Provide Supabase env vars at build time.
- If hosting behind HTTPS, make sure backend supports CORS for the frontend origin.
- Prefer server-set secure httpOnly cookies for auth; avoid logging request bodies that include passwords.

## Contributing
- Keep UI changes consistent with existing design language.
- Prefer `src/lib/api.ts` for HTTP calls; add token attachment there.
- Run `npm run lint` before pushing.
