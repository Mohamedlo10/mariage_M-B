-- =============================================
-- Supabase Setup — Mariage M&B
-- Exécuter ce script dans le SQL Editor de Supabase
-- =============================================

-- 1. Table RSVP
create table if not exists public.rsvp (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  days integer[] not null default '{}',
  created_at timestamptz default now()
);

-- RLS pour rsvp
alter table public.rsvp enable row level security;

-- Tout le monde peut lire (pour le compteur)
create policy "rsvp_select_all"
  on public.rsvp for select
  using (true);

-- Tout le monde peut insérer (formulaire public)
create policy "rsvp_insert_anon"
  on public.rsvp for insert
  with check (true);

-- 2. Table Photos (mur des souvenirs)
create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  image_url text not null,
  author_name text not null default 'Anonyme',
  created_at timestamptz default now()
);

-- RLS pour photos
alter table public.photos enable row level security;

-- Tout le monde peut lire
create policy "photos_select_all"
  on public.photos for select
  using (true);

-- Tout le monde peut insérer
create policy "photos_insert_anon"
  on public.photos for insert
  with check (true);

-- Seuls les administrateurs connectés (authentifiés) peuvent supprimer
create policy "photos_delete_admin"
  on public.photos for delete
  using (auth.role() = 'authenticated');

-- =============================================
-- 3. Fonction RPC pour filtrer les RSVP (Recherche + Jours)
-- =============================================
create or replace function public.get_filtered_rsvps(
  search_term text default '',
  day_mode text default 'all'
)
returns setof public.rsvp
language plpgsql
security definer
as $$
begin
  return query
  select *
  from public.rsvp
  where 
    (search_term = '' or name ilike '%' || search_term || '%' or (phone is not null and phone ilike '%' || search_term || '%'))
    and (
      day_mode = 'all'
      or (day_mode = 'friday' and 0 = any(days))
      or (day_mode = 'saturday' and 1 = any(days))
      or (day_mode = 'sunday' and 2 = any(days))
    )
  order by created_at desc;
end;
$$;

-- =============================================
-- STORAGE BUCKETS
-- À créer manuellement dans Supabase Dashboard :
--
-- 1. Bucket "site-assets" (Public)
--    → Uploader toutes les images du dossier public/assets/
--
-- 2. Bucket "memory-wall" (Public)
--    → Les invités y uploadent leurs photos
--
-- Pour chaque bucket, ajouter ces policies dans
-- Storage > Policies :
--
-- site-assets :
--   SELECT → true (lecture publique)
--
-- memory-wall :
--   SELECT → true (lecture publique)
--   INSERT → true (upload anonyme)
--   DELETE → auth.role() = 'authenticated' (suppression admin)
-- =============================================
