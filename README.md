# Korvanis (Phase 0)

Site simple : annonces (vendre / chercher), chat anonyme avec numéros masqués, bouton "on est d'accord", avis, signalements. Pas de paiement.

## Mise en ligne
1. Supabase > SQL Editor > New query > colle tout `supabase/schema.sql` > Run (une seule fois).
2. Supabase > Authentication : désactive "Confirm email" pour le moment (sinon les inscriptions attendent un email de confirmation).
3. GitHub : envoie le contenu de ce dossier dans ton repo `korvanis` (sans `node_modules` ni `.next`).
4. Vercel > Add New > Project > importe le repo `korvanis` > Deploy.

## Tester en local (optionnel)
npm install && npm run dev

## Mise à jour 2
- Colle `supabase/migration_2.sql` dans Supabase > SQL Editor > Run (une seule fois).
- Notifications par email (optionnel) : ajoute dans Vercel > Settings > Environment Variables
  SUPABASE_SERVICE_ROLE_KEY, GMAIL_USER, GMAIL_APP_PASSWORD, puis redéploie.
  Sans ces variables, le site marche normalement, il n'envoie juste pas d'email.
