// Liste des clubs affichés sur le site. Modifie-la librement : un nom par ligne.
// (Les gens peuvent aussi choisir "Autre" et écrire un club qui n'est pas dans la liste.)
export const CLUBS = [
  "Opium",
  "Pacha",
  "Razzmatazz",
  "Shôko",
  "Carpe Diem",
  "Sutton",
  "Otto Zutz",
  "Input",
  "Sala Apolo",
  "Macarena",
  "Moog",
  "City Hall",
  "Bling Bling",
  "Jamboree",
  "Downtown",
  "Exclusive",
];
export const OTHER = "__other__";

// Positions APPROXIMATIVES pour la carte (lat, lng), écrites de mémoire :
// à vérifier sur Google Maps / OpenStreetMap avant de publier.
// Pour corriger : clic droit sur le club dans Google Maps, clique sur les chiffres, colle ici.
export const CLUB_COORDS: Record<string, [number, number]> = {
  Opium: [41.3862, 2.1977],
  Pacha: [41.3869, 2.1971],
  Razzmatazz: [41.3987, 2.1917],
  Shôko: [41.3864, 2.1975],
  "Carpe Diem": [41.3863, 2.1969],
  Sutton: [41.3949, 2.1521],
  "Otto Zutz": [41.4001, 2.1523],
  Input: [41.3678, 2.1490],
  "Sala Apolo": [41.3748, 2.1699],
  Macarena: [41.3797, 2.1770],
  Moog: [41.3775, 2.1738],
  "City Hall": [41.3877, 2.1700],
  "Bling Bling": [41.3946, 2.1469],
  Jamboree: [41.3800, 2.1753],
};
