-- Étape 1 : liste d'attente
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint waitlist_email_format check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint waitlist_email_length check (char_length(email) <= 254)
);

create unique index if not exists waitlist_email_unique on public.waitlist (lower(email));

alter table public.waitlist enable row level security;

-- Tout le monde peut s'inscrire, personne ne peut lire la liste côté client
-- (lecture uniquement via le service role, qui contourne la RLS).
drop policy if exists "waitlist_insert_public" on public.waitlist;
create policy "waitlist_insert_public"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);
