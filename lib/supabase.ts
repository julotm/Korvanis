import { createClient } from "@supabase/supabase-js";

// Ces deux valeurs sont publiques (clé "publishable"), pas de risque de les mettre dans le code.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://opiqfohikszbjxvuwaee.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  "sb_publishable_SWQvM1TYS4_4cdqYgQKsMQ_f6y-s7x7";

export const supabase = createClient(url, key);
