import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ALERT_TEMPLATES, EMBASSIES, FIRST_AID, HELPLINES, LANGS, LOCATIONS, ago, uid, type Alert, type Lang, type Report } from "@/lib/voyage-data";
import { supabase, toAlert, type AlertRow } from "@/lib/supabase";
import type { Filters } from "./CrisisMap";

const CrisisMap = lazy(() => import("./CrisisMap"));

// `alert`, `onSOS` and `sosSent` are now handled inside the component via Supabase.
type Props = { reports: Report[]; now: number; onReport: (text: string, location: string) => void };

export function TouristView({ reports, now, onReport }: Props) {
  const [alert, setAlert] = useState<Alert | undefined>();
  const [sosState, setSosState] = useState<"idle" | "locating" | "sent" | "error">("idle");
  const [sosError, setSosError] = useState<string | null>(null);
  const sosSent = sosState === "sent";

  const [lang, setLang] = useState<Lang>("en");
  const [speaking, setSpeaking] = useState(false);
  const [filters, setFilters] = useState<Filters>({ shelter: true, medical: true, routes: true });
  const [tab, setTab] = useState<"official" | "crowd">("official");
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [loc, setLoc] = useState<string>(LOCATIONS[0] ?? "Baga");
  const [kitOpen, setKitOpen] = useState<string | null>(null);

  /* Load latest alert + listen for new ones in realtime */
  useEffect(() => {
    let active = true;

    supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data, error }) => {
        if (error) return console.error("alerts load:", error.message);
        if (active && data?.[0]) setAlert(toAlert(data[0] as AlertRow));
      });

    const channel = supabase
      .channel("tourist-alerts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (p) => {
        setAlert(toAlert(p.new as AlertRow));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  /* SOS: capture GPS, insert into sos_beacons */
  const onSOS = () => {
    if (sosState === "locating" || sosSent) return;
    setSosError(null);
    if (!("geolocation" in navigator)) {
      setSosState("error");
      return setSosError("Geolocation is not supported on this device.");
    }
    setSosState("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { error } = await supabase.from("sos_beacons").insert({
          name: `Tourist-${uid().slice(0, 4)}`,
          status: "Needs Rescue",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          note: `Accuracy ±${Math.round(pos.coords.accuracy)}m`,
        });
        if (error) {
          setSosState("error");
          setSosError(error.message);
        } else setSosState("sent");
      },
      (err) => {
        setSosState("error");
        setSosError(err.code === err.PERMISSION_DENIED ? "Location permission denied. Please enable GPS and retry." : "Could not get your location. Please retry.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const t = alert ? ALERT_TEMPLATES[alert.kind] : undefined;
  const msg = t && alert ? t.text[lang].replace("{s}", alert.sector) : "";
  const sev = t?.severity === "critical" ? "bg-danger" : t?.severity === "warning" ? "bg-emergency" : "bg-safe";

  const speak = () => {
    if (!("speechSynthesis" in window) || !msg) return;
    speechSynthesis.cancel();
    if (speaking) return setSpeaking(false);
    const u = new SpeechSynthesisUtterance(msg);
    u.lang = LANGS.find((l) => l.id === lang)!.voice;
    u.onend = () => setSpeaking(false);
    setSpeaking(true); speechSynthesis.speak(u);
  };

  const list = reports.filter((r) => r.official === (tab === "official"));
  const filterBtns: { id: keyof Filters; label: string; dot: string }[] = [
    { id: "shelter", label: "Open Shelters", dot: "bg-safe" }, { id: "medical", label: "Medical Camps", dot: "bg-primary" }, { id: "routes", label: "Evacuation Routes", dot: "bg-emergency" },
  ];

  return (
    <div className="mx-auto w-full max-w-[420px] rounded-[2.5rem] border-8 border-ink bg-background shadow-2xl">
      <div className="flex justify-between px-6 pt-3 text-xs font-medium text-muted-foreground"><span>9:41</span><span>● ● ● 5G</span></div>
      <div className="max-h-[780px] space-y-4 overflow-y-auto p-4">
        {alert && t && (
          <section role="alert" className={`${sev} rounded-2xl p-4 text-on-color`}>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
              <span className="flex items-center gap-2"><span className="relative flex h-2.5 w-2.5"><span className="pulse-ring absolute h-2.5 w-2.5 rounded-full bg-on-color" /><span className="h-2.5 w-2.5 rounded-full bg-on-color" /></span>{t.label} · {ago(alert.at, now)}</span>
            </div>
            <p className="mt-2 text-lg font-bold leading-snug">{msg}</p>
            <div className="mt-3 flex gap-2">
              <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} aria-label="Translate alert" className="flex-1 rounded-lg bg-on-color/20 px-3 py-2 text-sm font-medium">
                {LANGS.map((l) => <option key={l.id} value={l.id} className="text-foreground">{l.label}</option>)}
              </select>
              <button onClick={speak} className="rounded-lg bg-on-color/20 px-3 py-2 text-sm font-bold hover:bg-on-color/30">{speaking ? "■ Stop" : "🔊 Listen"}</button>
            </div>
          </section>
        )}

        <button onClick={onSOS} disabled={sosSent || sosState === "locating"} className={`w-full rounded-2xl py-5 text-xl font-bold text-on-color shadow-lg transition active:scale-95 ${sosSent ? "bg-safe" : "bg-danger hover:brightness-110"}`}>
          {sosSent ? "✓ SOS sent — GPS shared with rescue" : sosState === "locating" ? "Getting your location…" : "🆘 SOS / Need Help"}
        </button>
        {sosError && <p role="alert" className="-mt-2 text-sm text-danger">{sosError}</p>}

        <section className="rounded-2xl border bg-card p-3">
          <h2 className="font-bold">Safe-zone map</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {filterBtns.map((f) => (
              <button key={f.id} aria-pressed={filters[f.id]} onClick={() => setFilters({ ...filters, [f.id]: !filters[f.id] })}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${filters[f.id] ? "bg-muted" : "opacity-50"}`}>
                <span className={`h-2 w-2 rounded-full ${f.dot}`} />{f.label}
              </button>
            ))}
          </div>
          <div className="relative z-0 mt-2 h-64 overflow-hidden rounded-xl bg-muted">
            <ClientOnly fallback={null}><Suspense fallback={null}><CrisisMap filters={filters} /></Suspense></ClientOnly>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground"><span className="text-danger">■</span> High-risk flood zone</p>
        </section>

        <section className="rounded-2xl border bg-card p-3">
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm font-medium">
            {(["official", "crowd"] as const).map((k) => (
              <button key={k} onClick={() => setTab(k)} className={`rounded-md py-1.5 ${tab === k ? "bg-card shadow" : "text-muted-foreground"}`}>
                {k === "official" ? "Official Broadcasts" : "Ground Reports"}
              </button>
            ))}
          </div>
          {tab === "crowd" && (showForm ? (
            <form className="mt-3 space-y-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onReport(text.trim(), loc); setText(""); setShowForm(false); } }}>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="What do you see?" aria-label="Report" className="w-full rounded-md border bg-background px-3 py-2 text-sm" />
              <div className="flex gap-2">
                <select value={loc} onChange={(e) => setLoc(e.target.value)} aria-label="Location" className="flex-1 rounded-md border bg-background px-2 text-sm">
                  {LOCATIONS.map((l) => <option key={l}>📍 {l}</option>)}
                </select>
                <button className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Submit</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowForm(true)} className="mt-3 w-full rounded-md border border-dashed py-2 text-sm font-medium text-primary">+ Submit ground report</button>
          ))}
          <ul className="mt-3 space-y-2">
            {list.map((r) => (
              <li key={r.id} className={`rounded-xl p-3 text-sm ${r.official ? "border-l-4 border-l-primary bg-primary/5" : "bg-muted"}`}>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold">{r.author}</span>
                  {r.official ? <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">✓</span> : <span className="text-muted-foreground">· unverified</span>}
                  <span className="ml-auto text-muted-foreground">{ago(r.at, now)}</span>
                </div>
                <p className="mt-1">{r.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">📍 {r.location}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card">
          <h2 className="px-3 pt-3 font-bold">Offline Survival Kit <span className="text-xs font-normal text-safe">· available offline</span></h2>
          {[
            { id: "num", title: "Emergency numbers", items: HELPLINES.map((h): [string, string] => [h.name, h.num]) },
            { id: "emb", title: "Embassy contacts", items: EMBASSIES.map((h): [string, string] => [h.name, h.num]) },
            { id: "aid", title: "First-aid checklist", items: FIRST_AID.map((f): [string, string] => [f, ""]) },
          ].map((s) => (
            <div key={s.id} className="border-t first:border-t-0">
              <button onClick={() => setKitOpen(kitOpen === s.id ? null : s.id)} aria-expanded={kitOpen === s.id} className="flex w-full justify-between px-3 py-3 text-sm font-medium">
                {s.title}<span>{kitOpen === s.id ? "−" : "+"}</span>
              </button>
              {kitOpen === s.id && (
                <ul className="space-y-1 px-3 pb-3 text-sm">
                  {s.items.map(([a, b]) => (
                    <li key={a} className="flex justify-between gap-2 rounded-md bg-muted px-2 py-1.5">
                      {b ? <><span>{a}</span><a href={`tel:${b.replace(/\s/g, "")}`} className="font-bold text-primary">{b}</a></> : <label className="flex gap-2"><input type="checkbox" className="accent-primary" />{a}</label>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
