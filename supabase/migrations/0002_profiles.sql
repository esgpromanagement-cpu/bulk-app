-- Étape 2 : profils utilisateurs (rempli à la fin de l'onboarding)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  prenom text not null check (char_length(prenom) between 1 and 40),
  age smallint not null check (age between 18 and 99),
  taille_cm smallint not null check (taille_cm between 140 and 220),
  poids_kg numeric(5, 1) not null check (poids_kg between 35 and 200),
  niveau text not null check (niveau in ('debutant', 'intermediaire', 'confirme')),
  materiel text not null check (materiel in ('salle', 'maison_halteres', 'poids_du_corps')),
  seances_semaine smallint not null check (seances_semaine between 2 and 6),
  -- Prise de masse visée sur 6 mois. Plafond global de sécurité ; le plafond
  -- par niveau est appliqué par le trigger ci-dessous.
  objectif_kg numeric(3, 1) not null check (objectif_kg > 0 and objectif_kg <= 6),
  is_premium boolean not null default false,
  stripe_customer_id text unique,
  created_at timestamptz not null default now()
);

-- Garde-fou : objectif réaliste selon le niveau (≈ 1 kg/mois max pour un débutant).
create or replace function public.check_objectif_kg()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  max_kg numeric := case new.niveau
    when 'debutant' then 6
    when 'intermediaire' then 4
    else 2.5
  end;
begin
  if new.objectif_kg > max_kg then
    raise exception 'objectif_kg % trop élevé pour le niveau % (max %)',
      new.objectif_kg, new.niveau, max_kg
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_check_objectif on public.profiles;
create trigger profiles_check_objectif
  before insert or update on public.profiles
  for each row execute function public.check_objectif_kg();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- is_premium et stripe_customer_id ne sont modifiables que par le service role
-- (webhook Stripe) : l'utilisateur ne peut écrire que ses infos d'onboarding.
revoke insert, update on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant insert (id, prenom, age, taille_cm, poids_kg, niveau, materiel, seances_semaine, objectif_kg)
  on public.profiles to authenticated;
grant update (prenom, age, taille_cm, poids_kg, niveau, materiel, seances_semaine, objectif_kg)
  on public.profiles to authenticated;
