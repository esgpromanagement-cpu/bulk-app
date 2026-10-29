# Bulk — skinny → muscle (PWA)

Next.js 15 (App Router) · TypeScript · Tailwind v4 · shadcn/ui · Supabase

## Démarrage

1. `cp .env.example .env.local` et remplir les variables Supabase.
2. Dans Supabase → SQL Editor, exécuter `supabase/migrations/0001_waitlist.sql`.
3. Supabase → Authentication :
   - **URL Configuration** : Site URL = `NEXT_PUBLIC_APP_URL`, et ajouter `http://localhost:3000/auth/callback` (+ l'URL Vercel) dans les Redirect URLs.
   - **Providers** : Email (magic link) activé ; Google activé avec Client ID / Secret
     (redirect URI côté Google Cloud : `https://<projet>.supabase.co/auth/v1/callback`).
4. `npm install && npm run dev`

## Routes (étape 1)

- `/` landing + liste d'attente (table `waitlist`, insertion seule via RLS)
- `/connexion` magic link + Google
- `/auth/callback` échange du code PKCE → session
- `/auth/deconnexion` (POST)
- `/onboarding` placeholder protégé (étape 2)
