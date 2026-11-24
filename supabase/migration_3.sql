-- Korvanis — mise à jour 3 : nom d'événement (Halloween, End of exams…)
-- À coller UNE FOIS dans Supabase > SQL Editor > New query > Run
alter table public.listings
  add column if not exists event_name text
  check (event_name is null or char_length(event_name) between 2 and 80);
