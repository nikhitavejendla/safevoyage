export type Lang = "en" | "es" | "fr" | "ja" | "hi" | "de";
export const LANGS: { id: Lang; label: string; voice: string }[] = [
  { id: "en", label: "English", voice: "en-US" }, { id: "es", label: "Español", voice: "es-ES" },
  { id: "fr", label: "Français", voice: "fr-FR" }, { id: "ja", label: "日本語", voice: "ja-JP" },
  { id: "hi", label: "हिन्दी", voice: "hi-IN" }, { id: "de", label: "Deutsch", voice: "de-DE" },
];

export type AlertKind = "flood" | "cyclone" | "landslide" | "clear";
export const ALERT_TEMPLATES: Record<AlertKind, { label: string; severity: "critical" | "warning" | "info"; text: Record<Lang, string> }> = {
  flood: { label: "Flash flood", severity: "critical", text: {
    en: "Flash Flood Warning in {s} — Seek higher ground immediately.",
    es: "Alerta de inundación repentina en {s}: busque terreno elevado de inmediato.",
    fr: "Alerte crue soudaine dans {s} — Gagnez immédiatement un terrain élevé.",
    ja: "{s}に鉄砲水警報 — 直ちに高台へ避難してください。",
    hi: "{s} में अचानक बाढ़ की चेतावनी — तुरंत ऊँचे स्थान पर जाएँ।",
    de: "Sturzflutwarnung in {s} — Suchen Sie sofort höher gelegenes Gelände auf." } },
  cyclone: { label: "Cyclone", severity: "critical", text: {
    en: "Severe Cyclone approaching {s} — Stay indoors, away from windows.",
    es: "Ciclón severo se acerca a {s}: permanezca en interiores, lejos de ventanas.",
    fr: "Cyclone violent approchant de {s} — Restez à l'intérieur, loin des fenêtres.",
    ja: "強い台風が{s}に接近中 — 屋内に留まり窓から離れてください。",
    hi: "गंभीर चक्रवात {s} की ओर — घर के अंदर रहें, खिड़कियों से दूर।",
    de: "Schwerer Zyklon nähert sich {s} — Bleiben Sie drinnen, fern von Fenstern." } },
  landslide: { label: "Landslide", severity: "warning", text: {
    en: "Landslide risk near {s} — Avoid hillside roads.",
    es: "Riesgo de deslizamiento cerca de {s}: evite carreteras de ladera.",
    fr: "Risque de glissement de terrain près de {s} — Évitez les routes de colline.",
    ja: "{s}付近で土砂崩れの危険 — 山沿いの道路を避けてください。",
    hi: "{s} के पास भूस्खलन का खतरा — पहाड़ी सड़कों से बचें।",
    de: "Erdrutschgefahr nahe {s} — Meiden Sie Hangstraßen." } },
  clear: { label: "All clear", severity: "info", text: {
    en: "All clear for {s} — Water receding. Follow official guidance before returning.",
    es: "Sin peligro en {s}: el agua retrocede. Siga las indicaciones oficiales antes de regresar.",
    fr: "Fin d'alerte pour {s} — L'eau se retire. Suivez les consignes avant de revenir.",
    ja: "{s}の警報解除 — 水が引いています。戻る前に公式の指示に従ってください。",
    hi: "{s} के लिए खतरा टला — पानी उतर रहा है। लौटने से पहले आधिकारिक निर्देश मानें।",
    de: "Entwarnung für {s} — Wasser geht zurück. Folgen Sie vor der Rückkehr den Anweisungen." } },
};
export const SECTORS = ["Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5"];

export type Alert = { id: string; kind: AlertKind; sector: string; at: number };

export type PlaceKind = "shelter" | "medical" | "embassy";
export const PLACES: { name: string; kind: PlaceKind; pos: [number, number]; note: string }[] = [
  { name: "Arpora Hill School", kind: "shelter", pos: [15.575, 73.77], note: "Open · 20% full" },
  { name: "Saligao Community Centre", kind: "shelter", pos: [15.56, 73.785], note: "Open · 65% full" },
  { name: "St. Alex Church Hall", kind: "shelter", pos: [15.545, 73.775], note: "Open · 40% full" },
  { name: "Red Cross Medical Camp", kind: "medical", pos: [15.552, 73.79], note: "First aid · 24/7" },
  { name: "Field Hospital Parra", kind: "medical", pos: [15.582, 73.79], note: "Trauma care" },
  { name: "UK Consular Desk", kind: "embassy", pos: [15.567, 73.8], note: "Passport help" },
];
export const FLOOD_ZONES: { name: string; points: [number, number][] }[] = [
  { name: "Sector 4 — Baga riverbank", points: [[15.562, 73.748], [15.568, 73.755], [15.563, 73.762], [15.556, 73.754]] },
  { name: "Sector 2 — Calangute beach road", points: [[15.543, 73.755], [15.548, 73.758], [15.544, 73.766], [15.538, 73.762]] },
];
export const ROUTES: { name: string; points: [number, number][] }[] = [
  { name: "Route A → Arpora Hill", points: [[15.558, 73.758], [15.565, 73.765], [15.575, 73.77]] },
  { name: "Route B → St. Alex", points: [[15.541, 73.76], [15.543, 73.768], [15.545, 73.775]] },
];

export type Report = { id: string; author: string; text: string; location: string; at: number; official: boolean; source?: string };
export const LOCATIONS = ["Baga", "Calangute", "Arpora", "Saligao", "Candolim", "Current GPS"];

export type Beacon = { id: string; name: string; lat: number; lng: number; at: number; status: "Needs Rescue" | "Safe"; note: string };

const H = 36e5;
export function seedState(now: number) {
  return {
    alerts: [{ id: "a1", kind: "flood" as AlertKind, sector: "Sector 4", at: now - 4 * 6e4 }],
    reports: [
      { id: "o1", author: "State Disaster Mgmt Authority", source: "Government", official: true, text: "Shelters at Arpora Hill School and St. Alex Church Hall open 24/7.", location: "Arpora", at: now - 0.2 * H },
      { id: "o2", author: "India Meteorological Dept.", source: "Weather Bureau", official: true, text: "Heavy rainfall (>120mm) expected next 6 hours. Flood risk high.", location: "Calangute", at: now - 0.7 * H },
      { id: "o3", author: "Calangute Police", source: "Police", official: true, text: "Baga bridge CLOSED to all traffic.", location: "Baga", at: now - 1.1 * H },
      { id: "c1", author: "Lena (DE)", official: false, text: "Saligao road clear, walked to the community centre.", location: "Saligao", at: now - 0.4 * H },
      { id: "c2", author: "Kenji (JP)", official: false, text: "Water knee-deep near Tito's Lane. Don't go.", location: "Baga", at: now - 0.9 * H },
    ] as Report[],
    beacons: [
      { id: "b1", name: "Maria G. (ES)", lat: 15.5631, lng: 73.7552, at: now - 8 * 6e4, status: "Needs Rescue", note: "Stuck on 2nd floor, 3 people" },
      { id: "b2", name: "Tom R. (UK)", lat: 15.5452, lng: 73.7621, at: now - 25 * 6e4, status: "Needs Rescue", note: "Elderly, mobility issue" },
      { id: "b3", name: "Aiko S. (JP)", lat: 15.5748, lng: 73.7703, at: now - 55 * 6e4, status: "Safe", note: "Reached shelter" },
    ] as Beacon[],
  };
}

export const HELPLINES = [
  { name: "National Emergency", num: "112" }, { name: "Tourist Helpline", num: "1363" },
  { name: "Disaster Mgmt", num: "1078" }, { name: "Ambulance", num: "108" },
];
export const EMBASSIES = [
  { name: "British Deputy High Commission", num: "+91 22 6650 2222" },
  { name: "US Consulate Mumbai", num: "+91 22 2672 4000" },
  { name: "German Consulate Mumbai", num: "+91 22 2283 2422" },
  { name: "Embassy of Japan", num: "+91 11 4610 4610" },
];
export const FIRST_AID = [
  "Move away from floodwater — 15cm can knock you down", "Don't touch electrical equipment if wet",
  "Clean wounds with bottled water", "Keep warm, remove wet clothing", "Drink only sealed/boiled water",
  "Keep passport in a waterproof bag",
];

export const ago = (t: number, now: number) => {
  const m = Math.max(0, Math.round((now - t) / 6e4));
  return m < 1 ? "just now" : m < 60 ? `${m}m ago` : `${Math.round(m / 60)}h ago`;
};
export const uid = () => Math.random().toString(36).slice(2, 9);
