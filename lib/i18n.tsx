"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "fr" | "es";

const en = {
  post: "+ Post", inbox: "Inbox", logout: "Log out", login: "Log in",
  footer: "Korvanis is a meeting place between students. We don't sell tickets and we don't take any commission. Resell at face value at most.",
  hero_title: "Club tickets, student to student.",
  hero_sub: "Post a ticket you can't use, or ask for one. No commission, no names shown.",
  hero_cta: "Post a ticket or a request",
  how_title: "How it works",
  step1_t: "Post", step1_d: "Add the club, the night and your price.",
  step2_t: "Chat", step2_d: "Talk anonymously in the app.",
  step3_t: "Meet", step3_d: "Agree, hand over the ticket, rate each other.",
  tab_sell: "For sale", tab_want: "Wanted",
  search_ph: "Search a club", all: "All", other: "Other", loading: "Loading…",
  empty_club: "No tickets for {club} yet.", empty_all: "Nothing here yet.",
  empty_sub: "Be the first to post!",
  empty_cta_sell: "Sell a ticket", empty_cta_want: "Ask for a ticket",
  upto: "up to", tix_one: "{n} ticket", tix_many: "{n} tickets",
  back: "← Back", for_sale_tag: "FOR SALE", wanted_tag: "WANTED",
  face_value: "Face value", posted_by: "Posted by", no_reviews: "no reviews yet",
  closed_notice: "This listing is closed.",
  interested: "I'm interested", i_have_one: "I have one",
  close_listing: "Close this listing (sold / no longer needed)",
  share_wa: "Share on WhatsApp", copy_link: "Copy link", copied: "Link copied!",
  share_text: "{club} · {date} · {price} on Korvanis",
  report_listing: "Report this listing", report_ph: "What's wrong with this listing?",
  send_report: "Send report", report_thanks: "Thanks, we'll look into it.",
  not_found: "Listing not found.",
  login_title_signup: "Create your account", login_title_login: "Log in",
  login_sub: "Other users only ever see your nickname, never your name or email.",
  nickname: "Nickname", nickname_ph: "e.g. nightowl42", email: "Email", password: "Password",
  sign_up: "Sign up", have_account: "Already have an account? Log in", new_here: "New here? Sign up",
  nick_len: "Pick a nickname between 3 and 20 characters.",
  nick_taken: "That nickname is already taken.",
  check_email: "Check your inbox to confirm your email, then log in.",
  new_title: "Post", i_sell: "I sell a ticket", i_look: "I'm looking for one",
  club: "Club", club_choose: "Choose a club", club_other_ph: "Club name",
  night_date: "Date of the night", face_label: "Face value (€)",
  your_price: "Your price (€)", max_price: "Max price (€)", tickets: "Tickets",
  face_hint: "Face value is what you paid. You can sell at that price or lower, not higher.",
  note: "Note (optional)", note_sell_ph: "QR code, entry before 2am, …", note_want_ph: "Any detail that helps",
  publish: "Publish", bad_prices: "Please enter valid prices.",
  price_above_face: "Your price can't be higher than what you paid (face value).",
  need_club: "Please choose a club.",
  inbox_title: "Inbox", inbox_empty: "No conversations yet.", with: "with",
  chat_notice: "Phone numbers, @handles and links are hidden until you both tap \"We're agreed\". Agree on the price and how you'll hand over the ticket, then confirm.",
  already_confirmed: "{name} already confirmed.", say_hi: "Say hi and agree on the details.",
  message_ph: "Message…", send: "Send", agreed_btn: "We're agreed",
  waiting: "Waiting for {name} to confirm…", deal_confirmed: "Deal confirmed.",
  contacts_visible: "Contact details are now visible.", rate: "After the night, rate {name}:",
  comment_ph: "Comment (optional)", send_review: "Send review", review_thanks: "Thanks for your review!",
  report_problem: "Report a problem (scam, no-show…)", report_what: "What happened?",
  lang_name: "English",
};
type Dict = typeof en;

const fr: Dict = {
  post: "+ Publier", inbox: "Messages", logout: "Déconnexion", login: "Connexion",
  footer: "Korvanis est un lieu de rencontre entre étudiants. On ne vend pas de billets et on ne prend aucune commission. Revends au prix payé maximum.",
  hero_title: "Billets de boîte, d'étudiant à étudiant.",
  hero_sub: "Publie un billet que tu ne peux pas utiliser, ou demande-en un. Zéro commission, aucun nom affiché.",
  hero_cta: "Publier un billet ou une demande",
  how_title: "Comment ça marche",
  step1_t: "Publie", step1_d: "Ajoute la boîte, la soirée et ton prix.",
  step2_t: "Discute", step2_d: "Parle anonymement dans l'app.",
  step3_t: "Retrouvez-vous", step3_d: "Mettez-vous d'accord, passez le billet, notez-vous.",
  tab_sell: "À vendre", tab_want: "Recherchés",
  search_ph: "Chercher une boîte", all: "Toutes", other: "Autre", loading: "Chargement…",
  empty_club: "Aucun billet pour {club} pour l'instant.", empty_all: "Rien ici pour l'instant.",
  empty_sub: "Sois le premier à publier !",
  empty_cta_sell: "Vendre un billet", empty_cta_want: "Demander un billet",
  upto: "jusqu'à", tix_one: "{n} billet", tix_many: "{n} billets",
  back: "← Retour", for_sale_tag: "À VENDRE", wanted_tag: "RECHERCHÉ",
  face_value: "Prix d'origine", posted_by: "Publié par", no_reviews: "pas encore d'avis",
  closed_notice: "Cette annonce est fermée.",
  interested: "Ça m'intéresse", i_have_one: "J'en ai un",
  close_listing: "Fermer l'annonce (vendu / plus besoin)",
  share_wa: "Partager sur WhatsApp", copy_link: "Copier le lien", copied: "Lien copié !",
  share_text: "{club} · {date} · {price} sur Korvanis",
  report_listing: "Signaler cette annonce", report_ph: "Qu'est-ce qui ne va pas avec cette annonce ?",
  send_report: "Envoyer le signalement", report_thanks: "Merci, on regarde ça.",
  not_found: "Annonce introuvable.",
  login_title_signup: "Crée ton compte", login_title_login: "Connexion",
  login_sub: "Les autres utilisateurs voient seulement ton pseudo, jamais ton nom ni ton email.",
  nickname: "Pseudo", nickname_ph: "ex. nightowl42", email: "Email", password: "Mot de passe",
  sign_up: "Créer le compte", have_account: "Déjà un compte ? Connecte-toi", new_here: "Nouveau ? Crée un compte",
  nick_len: "Choisis un pseudo de 3 à 20 caractères.",
  nick_taken: "Ce pseudo est déjà pris.",
  check_email: "Vérifie ta boîte mail pour confirmer ton email, puis connecte-toi.",
  new_title: "Publier", i_sell: "Je vends un billet", i_look: "Je cherche un billet",
  club: "Boîte", club_choose: "Choisis une boîte", club_other_ph: "Nom de la boîte",
  night_date: "Date de la soirée", face_label: "Prix d'origine (€)",
  your_price: "Ton prix (€)", max_price: "Prix max (€)", tickets: "Billets",
  face_hint: "Le prix d'origine, c'est ce que tu as payé. Tu peux vendre à ce prix ou moins, pas plus cher.",
  note: "Note (facultatif)", note_sell_ph: "QR code, entrée avant 2h, …", note_want_ph: "Un détail utile",
  publish: "Publier", bad_prices: "Entre des prix valides.",
  price_above_face: "Ton prix ne peut pas dépasser ce que tu as payé.",
  need_club: "Choisis une boîte.",
  inbox_title: "Messages", inbox_empty: "Aucune conversation pour l'instant.", with: "avec",
  chat_notice: "Les numéros, @pseudos et liens sont masqués tant que vous n'avez pas tous les deux appuyé sur « On est d'accord ». Mettez-vous d'accord sur le prix et la façon de passer le billet, puis confirmez.",
  already_confirmed: "{name} a déjà confirmé.", say_hi: "Dis bonjour et mettez-vous d'accord sur les détails.",
  message_ph: "Message…", send: "Envoyer", agreed_btn: "On est d'accord",
  waiting: "En attente de la confirmation de {name}…", deal_confirmed: "Accord confirmé.",
  contacts_visible: "Les coordonnées sont maintenant visibles.", rate: "Après la soirée, note {name} :",
  comment_ph: "Commentaire (facultatif)", send_review: "Envoyer l'avis", review_thanks: "Merci pour ton avis !",
  report_problem: "Signaler un problème (arnaque, absence…)", report_what: "Que s'est-il passé ?",
  lang_name: "Français",
};

const es: Dict = {
  post: "+ Publicar", inbox: "Mensajes", logout: "Salir", login: "Entrar",
  footer: "Korvanis es un punto de encuentro entre estudiantes. No vendemos entradas ni cobramos comisión. Revende como máximo al precio que pagaste.",
  hero_title: "Entradas de discoteca, de estudiante a estudiante.",
  hero_sub: "Publica una entrada que no puedes usar, o pide una. Sin comisión, sin nombres visibles.",
  hero_cta: "Publicar una entrada o una petición",
  how_title: "Cómo funciona",
  step1_t: "Publica", step1_d: "Añade la discoteca, la noche y tu precio.",
  step2_t: "Habla", step2_d: "Habla de forma anónima en la app.",
  step3_t: "Quedad", step3_d: "Poneos de acuerdo, pasad la entrada y valoraos.",
  tab_sell: "En venta", tab_want: "Se busca",
  search_ph: "Buscar una discoteca", all: "Todas", other: "Otra", loading: "Cargando…",
  empty_club: "Todavía no hay entradas para {club}.", empty_all: "Todavía no hay nada aquí.",
  empty_sub: "Sé el primero en publicar!",
  empty_cta_sell: "Vender una entrada", empty_cta_want: "Pedir una entrada",
  upto: "hasta", tix_one: "{n} entrada", tix_many: "{n} entradas",
  back: "← Volver", for_sale_tag: "EN VENTA", wanted_tag: "SE BUSCA",
  face_value: "Precio original", posted_by: "Publicado por", no_reviews: "sin valoraciones todavía",
  closed_notice: "Este anuncio está cerrado.",
  interested: "Me interesa", i_have_one: "Tengo una",
  close_listing: "Cerrar el anuncio (vendida / ya no hace falta)",
  share_wa: "Compartir por WhatsApp", copy_link: "Copiar enlace", copied: "Enlace copiado!",
  share_text: "{club} · {date} · {price} en Korvanis",
  report_listing: "Denunciar este anuncio", report_ph: "Qué pasa con este anuncio?",
  send_report: "Enviar denuncia", report_thanks: "Gracias, lo revisaremos.",
  not_found: "Anuncio no encontrado.",
  login_title_signup: "Crea tu cuenta", login_title_login: "Entrar",
  login_sub: "Los demás usuarios solo ven tu apodo, nunca tu nombre ni tu email.",
  nickname: "Apodo", nickname_ph: "ej. nightowl42", email: "Email", password: "Contraseña",
  sign_up: "Crear cuenta", have_account: "Ya tienes cuenta? Entra", new_here: "Eres nuevo? Crea una cuenta",
  nick_len: "Elige un apodo de 3 a 20 caracteres.",
  nick_taken: "Ese apodo ya está cogido.",
  check_email: "Revisa tu correo para confirmar tu email y luego entra.",
  new_title: "Publicar", i_sell: "Vendo una entrada", i_look: "Busco una entrada",
  club: "Discoteca", club_choose: "Elige una discoteca", club_other_ph: "Nombre de la discoteca",
  night_date: "Fecha de la noche", face_label: "Precio original (€)",
  your_price: "Tu precio (€)", max_price: "Precio máximo (€)", tickets: "Entradas",
  face_hint: "El precio original es lo que pagaste. Puedes vender a ese precio o menos, no más caro.",
  note: "Nota (opcional)", note_sell_ph: "Código QR, entrada antes de las 2h, …", note_want_ph: "Algún detalle útil",
  publish: "Publicar", bad_prices: "Introduce precios válidos.",
  price_above_face: "Tu precio no puede superar lo que pagaste.",
  need_club: "Elige una discoteca.",
  inbox_title: "Mensajes", inbox_empty: "Todavía no hay conversaciones.", with: "con",
  chat_notice: "Los teléfonos, @usuarios y enlaces están ocultos hasta que los dos pulséis \"Estamos de acuerdo\". Poneos de acuerdo en el precio y en cómo pasar la entrada, y luego confirmad.",
  already_confirmed: "{name} ya ha confirmado.", say_hi: "Saluda y poneos de acuerdo en los detalles.",
  message_ph: "Mensaje…", send: "Enviar", agreed_btn: "Estamos de acuerdo",
  waiting: "Esperando la confirmación de {name}…", deal_confirmed: "Acuerdo confirmado.",
  contacts_visible: "Los datos de contacto ya son visibles.", rate: "Después de la noche, valora a {name}:",
  comment_ph: "Comentario (opcional)", send_review: "Enviar valoración", review_thanks: "Gracias por tu valoración!",
  report_problem: "Denunciar un problema (estafa, plantón…)", report_what: "Qué ha pasado?",
  lang_name: "Español",
};

const DICTS: Record<Lang, Dict> = { en, fr, es };
export const LANGS: Lang[] = ["en", "fr", "es"];
export const LOCALES: Record<Lang, string> = { en: "en-GB", fr: "fr-FR", es: "es-ES" };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: keyof Dict, vars?: Record<string, string | number>) => string;
};
const I18n = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => String(k) });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("korvanis_lang") as Lang | null;
      if (saved && DICTS[saved]) return setLangState(saved);
    } catch {}
    const nav = (navigator.language || "en").slice(0, 2);
    if (nav === "fr" || nav === "es") setLangState(nav);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("korvanis_lang", l); } catch {}
    document.documentElement.lang = l;
  };

  const t: Ctx["t"] = (k, vars) => {
    let s: string = DICTS[lang][k] ?? DICTS.en[k] ?? String(k);
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, String(b));
    return s;
  };

  return <I18n.Provider value={{ lang, setLang, t }}>{children}</I18n.Provider>;
}

export const useT = () => useContext(I18n);
