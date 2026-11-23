-- Korvanis — mise à jour 2 : numéro WhatsApp privé, fermeture auto des annonces, notifications
-- À coller UNE FOIS dans Supabase > SQL Editor > New query > Run (après schema.sql)

-- 1. Numéros de téléphone, dans une table PRIVÉE (jamais lisible par les autres utilisateurs)
create table if not exists public.contacts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  phone text not null check (phone ~ '^\+[0-9]{8,15}$')
);
alter table public.contacts enable row level security;

create policy "contacts read own" on public.contacts
  for select to authenticated using (user_id = auth.uid());
create policy "contacts insert own" on public.contacts
  for insert to authenticated with check (user_id = auth.uid());
create policy "contacts update own" on public.contacts
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- À l'inscription, on copie le numéro (s'il est valide) dans contacts
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare ph text;
begin
  insert into public.profiles (id, pseudo)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'pseudo'), ''), 'user' || substr(new.id::text, 1, 6))
  );
  ph := nullif(trim(new.raw_user_meta_data->>'phone'), '');
  if ph is not null and ph ~ '^\+[0-9]{8,15}$' then
    insert into public.contacts (user_id, phone) values (new.id, ph);
  end if;
  return new;
end $$;

-- 2. Le numéro de l'autre n'est donné qu'une fois que les DEUX ont confirmé
create or replace function public.get_contact(conv uuid)
returns text language sql security definer set search_path = public stable as $$
  select (select phone from public.contacts
          where user_id = case when c.owner_id = auth.uid() then c.other_id else c.owner_id end)
  from public.conversations c
  where c.id = conv and c.owner_ok and c.other_ok and auth.uid() in (c.owner_id, c.other_id)
$$;
revoke all on function public.get_contact(uuid) from public, anon;
grant execute on function public.get_contact(uuid) to authenticated;

-- 3. "On est d'accord" : exige un numéro, et ferme l'annonce automatiquement
--    (annonce de 1 billet : fermée ; plusieurs billets : -1 à chaque accord)
create or replace function public.agree(conv uuid)
returns void language plpgsql security definer set search_path = public as $$
declare c public.conversations; was_unlocked boolean;
begin
  if not exists (select 1 from public.contacts where user_id = auth.uid()) then
    raise exception 'phone_required';
  end if;
  select * into c from public.conversations
    where id = conv and auth.uid() in (owner_id, other_id) for update;
  if not found then return; end if;
  was_unlocked := c.owner_ok and c.other_ok;
  update public.conversations
    set owner_ok = owner_ok or (owner_id = auth.uid()),
        other_ok = other_ok or (other_id = auth.uid())
    where id = conv returning * into c;
  if not was_unlocked and c.owner_ok and c.other_ok then
    update public.listings
      set quantity = case when quantity > 1 then quantity - 1 else quantity end,
          status = case when quantity <= 1 then 'closed' else status end
      where id = c.listing_id;
  end if;
end $$;
revoke all on function public.agree(uuid) from public, anon;
grant execute on function public.agree(uuid) to authenticated;

-- 4. Pour limiter les emails de notification
alter table public.conversations add column if not exists last_notified_at timestamptz;
