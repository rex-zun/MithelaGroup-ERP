# Mithela ERP

This workspace now includes a role-aware ERP shell for admin, director, and operator users with a modern SaaS-style UI.

## Authentication
- The app uses a Supabase-ready authentication layer in [src/context/AuthContext.tsx](src/context/AuthContext.tsx).
- If VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured, the app uses Supabase auth; otherwise it falls back to local demo credentials.

## Roles
- Admin: full access to dashboard, management, uploads, and reports.
- Director: access to director dashboard and reports.
- Operator: access to entry module and report export modules.

## Deployment
- Build with `npm run build`.
- Set the Vercel environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` before deployment.
