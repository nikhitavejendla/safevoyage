export type Lang = "en" | "es" | "fr" | "de" | "ja" | "hi";
export type Layer = "flood" | "safe" | "routes";

export const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "EN" }, { id: "es", label: "ES" }, { id: "fr", label: "FR" },
  { id: "de", label: "DE" }, { id: "ja", label: "日本" }, { id: "hi", label: "हि" },
];

export const BANNER: Record<Lang, { title: string; body: string }> = {
  en: { title: "Flash flood emergency — Calangute & Baga", body: "Move to higher ground now. Avoid Baga River bridge. Follow marked evacuation routes." },
  es: { title: "Emergencia por inundación — Calangute y Baga", body: "Diríjase a terreno elevado ahora. Evite el puente del río Baga. Siga las rutas de evacuación." },
  fr: { title: "Urgence crue soudaine — Calangute et Baga", body: "Gagnez un terrain élevé. Évitez le pont de la rivière Baga. Suivez les itinéraires d'évacuation." },
  de: { title: "Sturzflut-Notfall — Calangute & Baga", body: "Sofort höher gelegenes Gelände aufsuchen. Baga-Brücke meiden. Evakuierungsrouten folgen." },
  ja: { title: "鉄砲水緊急事態 — カラングート・バガ", body: "直ちに高台へ避難。バガ川の橋は避けてください。避難ルートに従ってください。" },
  hi: { title: "अचानक बाढ़ आपातकाल — कलंगुट और बागा", body: "तुरंत ऊँचे स्थान पर जाएँ। बागा नदी पुल से बचें। निकासी मार्गों का पालन करें।" },
};

export const FLOOD_AREAS: { name: string; note: string; points: [number, number][] }[] = [
  { name: "Baga riverbank", note: "1.2 m water", points: [[15.562, 73.748], [15.568, 73.755], [15.563, 73.762], [15.556, 73.754]] },
  { name: "Calangute beach road", note: "Road submerged", points: [[15.543, 73.755], [15.548, 73.758], [15.544, 73.766], [15.538, 73.762]] },
];
export const SAFE_ZONES: { name: string; cap: string; pos: [number, number] }[] = [
  { name: "St. Alex Church Hall", cap: "40% full", pos: [15.545, 73.775] },
  { name: "Saligao Community Centre", cap: "65% full", pos: [15.56, 73.785] },
  { name: "Arpora Hill School", cap: "20% full", pos: [15.575, 73.77] },
];
export const ROUTES: { name: string; points: [number, number][] }[] = [
  { name: "Route A → Arpora Hill", points: [[15.558, 73.758], [15.565, 73.765], [15.575, 73.77]] },
  { name: "Route B → St. Alex", points: [[15.541, 73.76], [15.543, 73.768], [15.545, 73.775]] },
];

export type Post = { id: string; author: string; role: "authority" | "tourist"; verified: boolean; text: string; at: number };
export const SEED_POSTS: Post[] = [
  { id: "1", author: "Goa Disaster Mgmt Authority", role: "authority", verified: true, text: "Shelters at Arpora Hill School and St. Alex Church Hall are open 24/7 with water and first aid.", at: Date.now() - 6e5 },
  { id: "2", author: "Lena (Germany)", role: "tourist", verified: true, text: "Saligao road is clear, we just walked it to the community centre.", at: Date.now() - 18e5 },
  { id: "3", author: "Calangute Police", role: "authority", verified: true, text: "Baga bridge CLOSED. Do not attempt to cross on foot or vehicle.", at: Date.now() - 36e5 },
];

export const CHECKLIST = [
  "Charge phone & power bank", "Save offline map of your area", "Keep passport & documents in waterproof bag",
  "Pack 2L water and snacks", "Note nearest shelter address", "Tell family/embassy your location",
  "Carry torch and whistle", "Keep essential medicines",
];

export const HELPLINES = [
  { name: "National Emergency", num: "112" }, { name: "Tourist Helpline", num: "1363" },
  { name: "Disaster Management", num: "1078" }, { name: "Ambulance", num: "108" },
  { name: "Police", num: "100" }, { name: "Fire", num: "101" },
];
