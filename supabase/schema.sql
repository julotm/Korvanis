-- Korvanis — schéma Phase 0 (à coller UNE FOIS dans Supabase > SQL Editor > Run)

-- 1. Profils (seulement un pseudo, jamais le vrai nom)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  pseudo text not null unique check (char_length(pseudo) between 3 and 20),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, pseudo)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'pseudo'), ''), 'user' || substr(new.id::text, 1, 6))
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Annonces (vendre / chercher)
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('sell', 'want')),
  club text not null check (char_length(club) between 2 and 60),
  event_date date not null,
  price_cents int not null check (price_cents >= 0 and price_cents <= 50000),
  face_cents int check (face_cents >= 0 and face_cents <= 50000),
  quantity int not null default 1 check (quantity between 1 and 10),
  note text check (note is null or char_length(note) <= 300),
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  -- prix coûtant maximum : on ne revend jamais plus cher que le prix payé
  constraint price_not_above_face check (
    kind = 'want' or (face_cents is not null and price_cents <= face_cents)
  )
);
create index listings_open_idx on public.listings (status, event_date);

-- 3. Conversations (une par acheteur/vendeur et par annonce)
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  other_id uuid not null references public.profiles(id) on delete cascade,
  owner_ok boolean not null default false,
  other_ok boolean not null default false,
  created_at timestamptz not null default now(),
  unique (listing_id, other_id),
  check (owner_id <> other_id)
);

-- 4. Messages
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index messages_conv_idx on public.messages (conversation_id, created_at);

-- Masque numéros, @pseudos et liens tant que les deux n'ont pas confirmé l'accord
create or replace function public.mask_contacts()
returns trigger language plpgsql security definer set search_path = public as $$
declare unlocked boolean;
begin
  select (owner_ok and other_ok) into unlocked from public.conversations where id = new.conversation_id;
  if not coalesce(unlocked, false) then
    new.body := regexp_replace(new.body, '(https?://\S+|www\.\S+|wa\.me\S*|t\.me\S*)', '[hidden]', 'gi');
    new.body := regexp_replace(new.body, '@[A-Za-z0-9_.]+', '[hidden]', 'g');
    new.body := regexp_replace(new.body, '\+?\d[\d\s.\-]{6,}\d', '[hidden]', 'g');
  end if;
  return new;
end $$;

create trigger mask_contacts_before_insert
  before insert on public.messages
  for each row execute function public.mask_contacts();

-- Bouton "On est d'accord" (chaque côté ne peut cocher que sa propre case)
create or replace function public.agree(conv uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
  set owner_ok = owner_ok or (owner_id = auth.uid()),
      other_ok = other_ok or (other_id = auth.uid())
  where id = conv and auth.uid() in (owner_id, other_id);
end $$;

revoke all on function public.agree(uuid) from public, anon;
grant execute on function public.agree(uuid) to authenticated;

-- 5. Avis
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  target_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text check (comment is null or char_length(comment) <= 300),
  created_at timestamptz not null default now(),
  unique (conversation_id, author_id)
);

-- 6. Signalements (tu les lis dans Supabase > Table Editor > reports)
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now()
);

-- 7. Sécurité (Row Level Security)
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.reports enable row level security;

create policy "profiles readable" on public.profiles
  for select using (true);

create policy "listings readable" on public.listings
  for select using (true);
create policy "listings insert own" on public.listings
  for insert to authenticated with check (user_id = auth.uid());
create policy "listings update own" on public.listings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "listings delete own" on public.listings
  for delete to authenticated using (user_id = auth.uid());

create policy "conversations members read" on public.conversations
  for select to authenticated using (auth.uid() in (owner_id, other_id));
create policy "conversations start" on public.conversations
  for insert to authenticated with check (
    other_id = auth.uid()
    and owner_id = (select l.user_id from public.listings l where l.id = listing_id)
  );

create policy "messages members read" on public.messages
  for select to authenticated using (
    exists (select 1 from public.conversations c
            where c.id = conversation_id and auth.uid() in (c.owner_id, c.other_id))
  );
create policy "messages members send" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (select 1 from public.conversations c
                where c.id = conversation_id and auth.uid() in (c.owner_id, c.other_id))
  );

create policy "reviews readable" on public.reviews
  for select using (true);
create policy "reviews after agreement" on public.reviews
  for insert to authenticated with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.owner_ok and c.other_ok
        and auth.uid() in (c.owner_id, c.other_id)
        and target_id = case when c.owner_id = auth.uid() then c.other_id else c.owner_id end
    )
  );

create policy "reports insert own" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid());
