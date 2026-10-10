import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeHarbor — Verified crisis alerts for tourists" },
      { name: "description", content: "Live, translated flood and cyclone alerts, danger zones and safe shelters for travelers." },
      { property: "og:title", content: "SafeHarbor — Verified crisis alerts for tourists" },
      { property: "og:description", content: "Live, translated flood and cyclone alerts, danger zones and safe shelters for travelers." },
    ],
  }),
  component: Index,
});

type Lang = "en" | "es" | "fr" | "de" | "ja" | "hi";
const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" }, { id: "es", label: "Español" }, { id: "fr", label: "Français" },
  { id: "de", label: "Deutsch" }, { id: "ja", label: "日本語" }, { id: "hi", label: "हिन्दी" },
];

const ALERTS: { level: "danger" | "warn" | "safe"; source: string; time: string; text: Record<Lang, string> }[] = [
  { level: "danger", source: "State Disaster Management Authority", time: "4 min ago", text: {
    en: "Flash flood warning: Riverside & Old Market. Move to higher ground immediately.",
    es: "Alerta de inundación repentina: Riverside y Mercado Viejo. Diríjase a terreno elevado de inmediato.",
    fr: "Alerte crue soudaine : Riverside et Vieux Marché. Gagnez immédiatement un terrain élevé.",
    de: "Sturzflutwarnung: Riverside & Alter Markt. Sofort höher gelegenes Gelände aufsuchen.",
    ja: "鉄砲水警報：リバーサイドと旧市場。直ちに高台へ避難してください。",
    hi: "अचानक बाढ़ चेतावनी: रिवरसाइड और पुराना बाज़ार। तुरंत ऊँचे स्थान पर जाएँ।" } },
  { level: "warn", source: "Meteorological Department", time: "22 min ago", text: {
    en: "Cyclone winds up to 90 km/h expected after 6 PM. Stay indoors.",
    es: "Vientos ciclónicos de hasta 90 km/h después de las 18 h. Permanezca en interiores.",
    fr: "Vents cycloniques jusqu'à 90 km/h attendus après 18 h. Restez à l'intérieur.",
    de: "Zyklonwinde bis 90 km/h ab 18 Uhr erwartet. Bleiben Sie drinnen.",
    ja: "午後6時以降、最大風速90km/hのサイクロンが予想されます。屋内に留まってください。",
    hi: "शाम 6 बजे के बाद 90 किमी/घंटा तक चक्रवाती हवाएँ। घर के अंदर रहें।" } },
  { level: "safe", source: "City Police", time: "1 hr ago", text: {
    en: "Central Stadium shelter is open with food, water and medical aid.",
    es: "El refugio del Estadio Central está abierto con comida, agua y ayuda médica.",
    fr: "L'abri du Stade Central est ouvert : nourriture, eau et soins.",
    de: "Notunterkunft Zentralstadion geöffnet: Essen, Wasser, medizinische Hilfe.",
    ja: "中央スタジアム避難所が開設。食料・水・医療支援あり。",
    hi: "सेंट्रल स्टेडियम आश्रय खुला है — भोजन, पानी और चिकित्सा सहायता उपलब्ध।" } },
];

const ZONES = [
  { name: "Riverside", x: 18, y: 60, r: 14, level: "danger" },
  { name: "Old Market", x: 38, y: 72, r: 10, level: "danger" },
  { name: "Beach Road", x: 78, y: 78, r: 12, level: "warn" },
  { name: "Central Stadium", x: 55, y: 30, r: 5, level: "safe" },
  { name: "Hill Temple", x: 82, y: 22, r: 5, level: "safe" },
] as const;

const SHELTERS = [
  { name: "Central Stadium", dist: "1.2 km", cap: "62% full" },
  { name: "Hill Temple Hall", dist: "2.8 km", cap: "30% full" },
  { name: "St. Mary's School", dist: "3.4 km", cap: "85% full" },
];

const RUMORS = [
  { claim: "Airport is closed until Friday", verdict: "False", note: "Airport operating with delays." },
  { claim: "Bridge on NH-66 collapsed", verdict: "Unverified", note: "Authorities inspecting. Avoid route." },
  { claim: "Tap water unsafe in Old Market", verdict: "True", note: "Use bottled water only." },
];

const tone = { danger: "bg-danger", warn: "bg-warn", safe: "bg-safe" } as const;

function Index() {
  const [lang, setLang] = useState<Lang>("en");
  const [sos, setSos] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="relative flex h-3 w-3"><span className="pulse-ring absolute h-3 w-3 rounded-full bg-danger" /><span className="h-3 w-3 rounded-full bg-danger" /></span>
            SafeHarbor
          </div>
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Language"
            className="rounded-md bg-ink-foreground/10 px-3 py-2 text-sm text-ink-foreground">
            {LANGS.map((l) => <option key={l.id} value={l.id} className="text-foreground">{l.label}</option>)}
          </select>
        </div>
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-6">
          <p className="text-sm uppercase tracking-widest text-primary">Live · Coastal District · Cyclone Mira</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-6xl">Official alerts, in your language. Know where it's safe.</h1>
          <p className="mt-4 max-w-xl text-ink-foreground/70">Verified warnings from local authorities, translated instantly, with live danger zones and open shelters — no rumors.</p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-10 lg:grid-cols-5">
        <section className="lg:col-span-3 rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-bold">Live zone map</h2>
          <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-xl bg-muted">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
              <path d="M0 65 C20 55, 30 80, 50 70 S80 60, 100 72" className="fill-none stroke-safe/40" strokeWidth="3" />
              {ZONES.map((z) => (
                <circle key={z.name} cx={z.x} cy={z.y} r={z.r}
                  className={z.level === "danger" ? "fill-danger/40" : z.level === "warn" ? "fill-warn/50" : "fill-safe"} />
              ))}
            </svg>
            {ZONES.map((z) => (
              <span key={z.name} style={{ left: `${z.x}%`, top: `${z.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded bg-card/90 px-2 py-0.5 text-xs font-medium">{z.name}</span>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
            {(["danger", "warn", "safe"] as const).map((l) => (
              <span key={l} className="flex items-center gap-1.5"><span className={`h-2.5 w-2.5 rounded-full ${tone[l]}`} />{l === "danger" ? "Flooded / unsafe" : l === "warn" ? "Caution" : "Safe zone"}</span>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-xl font-bold">Verified alerts</h2>
          {ALERTS.map((a, i) => (
            <article key={i} className="rounded-2xl border bg-card p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${tone[a.level]}`} />✓ {a.source} · {a.time}
              </div>
              <p className="mt-2 font-medium">{a.text[lang]}</p>
            </article>
          ))}
        </section>

        <section className="lg:col-span-2 rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-bold">Nearest shelters</h2>
          <ul className="mt-3 divide-y">
            {SHELTERS.map((s) => (
              <li key={s.name} className="flex justify-between py-3">
                <span className="font-medium">{s.name}</span>
                <span className="text-sm text-muted-foreground">{s.dist} · {s.cap}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-3 rounded-2xl border bg-card p-5">
          <h2 className="text-xl font-bold">Rumor check</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {RUMORS.map((r) => (
              <div key={r.claim} className="rounded-xl bg-muted p-3">
                <span className={`rounded px-2 py-0.5 text-xs font-bold text-primary-foreground ${r.verdict === "False" ? "bg-danger" : r.verdict === "True" ? "bg-safe" : "bg-muted-foreground"}`}>{r.verdict}</span>
                <p className="mt-2 text-sm font-medium">"{r.claim}"</p>
                <p className="mt-1 text-xs text-muted-foreground">{r.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 flex flex-col items-center gap-3 rounded-2xl bg-ink p-8 text-center text-ink-foreground">
          <h2 className="text-2xl font-bold">Stranded or in danger?</h2>
          <button onClick={() => setSos(true)} className="rounded-full bg-danger px-10 py-4 text-lg font-bold text-primary-foreground transition hover:scale-105">
            {sos ? "Help requested — location shared" : "Send SOS"}
          </button>
          <p className="text-sm text-ink-foreground/60">Emergency: 112 · Tourist helpline: 1363</p>
        </section>
      </main>
    </div>
  );
}
