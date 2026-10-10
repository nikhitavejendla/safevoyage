import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { BANNER, CHECKLIST, HELPLINES, LANGS, SEED_POSTS, type Lang, type Layer, type Post } from "@/lib/crisis-data";

const CrisisMap = lazy(() => import("@/components/CrisisMap"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeHarbor — Crisis dashboard for tourists" },
      { name: "description", content: "Translated emergency alerts, live flood map, verified community updates and offline checklist for travelers." },
      { property: "og:title", content: "SafeHarbor — Crisis dashboard for tourists" },
      { property: "og:description", content: "Translated emergency alerts, live flood map, verified community updates and offline checklist for travelers." },
    ],
  }),
  component: Dashboard,
});

function useStored<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  useEffect(() => { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); }, [key]);
  const set = (n: T) => { setV(n); localStorage.setItem(key, JSON.stringify(n)); };
  return [v, set] as const;
}

const ago = (t: number) => { const m = Math.round((Date.now() - t) / 6e4); return m < 60 ? `${m}m ago` : `${Math.round(m / 60)}h ago`; };

function Dashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ flood: true, safe: true, routes: true });
  const [posts, setPosts] = useStored<Post[]>("sh-posts", SEED_POSTS);
  const [done, setDone] = useStored<string[]>("sh-check", []);
  const [role, setRole] = useState<Post["role"]>("tourist");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const u = () => setOnline(navigator.onLine); u();
    addEventListener("online", u); addEventListener("offline", u);
    return () => { removeEventListener("online", u); removeEventListener("offline", u); };
  }, []);

  const post = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosts([{ id: crypto.randomUUID(), author: name.trim() || "Anonymous traveler", role, verified: false, text: text.trim(), at: Date.now() }, ...posts]);
    setText("");
  };

  const b = BANNER[lang];
  const layerMeta: { id: Layer; label: string; dot: string }[] = [
    { id: "flood", label: "High-risk flood", dot: "bg-danger" },
    { id: "safe", label: "Safe zones", dot: "bg-safe" },
    { id: "routes", label: "Evacuation routes", dot: "bg-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-display text-lg font-bold">
            <span className="relative flex h-3 w-3"><span className="pulse-ring absolute h-3 w-3 rounded-full bg-danger" /><span className="h-3 w-3 rounded-full bg-danger" /></span>
            SafeHarbor
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${online ? "bg-safe/15 text-safe" : "bg-warn/30 text-foreground"}`}>
            {online ? "● Live" : "● Offline — showing saved data"}
          </span>
        </div>
      </header>

      <section role="alert" className="bg-danger text-primary-foreground">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Active emergency · Official</p>
            <h1 className="text-xl font-bold md:text-2xl">{b.title}</h1>
            <p className="mt-1 text-sm opacity-90">{b.body}</p>
          </div>
          <div className="flex flex-wrap gap-1" aria-label="Translate alert">
            {LANGS.map((l) => (
              <button key={l.id} onClick={() => setLang(l.id)} aria-pressed={lang === l.id}
                className={`min-w-11 rounded-md px-3 py-2 text-sm font-bold transition ${lang === l.id ? "bg-card text-danger" : "bg-primary-foreground/15 hover:bg-primary-foreground/25"}`}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Live map</h2>
            <div className="flex flex-wrap gap-2">
              {layerMeta.map((l) => (
                <button key={l.id} onClick={() => setLayers({ ...layers, [l.id]: !layers[l.id] })} aria-pressed={layers[l.id]}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${layers[l.id] ? "bg-muted" : "opacity-50"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${l.dot}`} />{l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative z-0 mt-3 h-[420px] overflow-hidden rounded-xl bg-muted">
            <ClientOnly fallback={<div className="grid h-full place-items-center text-sm text-muted-foreground">Loading map…</div>}>
              <Suspense fallback={null}><CrisisMap layers={layers} /></Suspense>
            </ClientOnly>
          </div>
        </section>

        <section className="flex flex-col rounded-2xl border bg-card p-4 lg:row-span-2">
          <h2 className="text-lg font-bold">Community status</h2>
          <form onSubmit={post} className="mt-3 space-y-2 rounded-xl bg-muted p-3">
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Your name"
                className="min-w-0 flex-1 rounded-md border bg-card px-3 py-2 text-sm" />
              <select value={role} onChange={(e) => setRole(e.target.value as Post["role"])} aria-label="Role" className="rounded-md border bg-card px-2 text-sm">
                <option value="tourist">Tourist</option><option value="authority">Authority</option>
              </select>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder="Share an update (road status, shelter, help needed)…" aria-label="Update"
              className="w-full rounded-md border bg-card px-3 py-2 text-sm" />
            <button className="w-full rounded-md bg-primary py-2 text-sm font-bold text-primary-foreground hover:opacity-90">Post update</button>
            <p className="text-xs text-muted-foreground">New posts show “Pending verification” until moderators confirm.</p>
          </form>
          <ul className="mt-3 space-y-3 overflow-y-auto lg:max-h-[640px]">
            {posts.map((p) => (
              <li key={p.id} className={`rounded-xl border p-3 ${p.role === "authority" ? "border-l-4 border-l-primary" : ""}`}>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold">{p.author}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 capitalize">{p.role}</span>
                  {p.verified ? <span className="font-medium text-safe">✓ Verified</span> : <span className="text-muted-foreground">⏳ Pending verification</span>}
                  <span className="ml-auto text-muted-foreground">{ago(p.at)}</span>
                </div>
                <p className="mt-1.5 text-sm">{p.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Emergency checklist</h2>
            <span className="text-xs text-muted-foreground">{done.length}/{CHECKLIST.length} · saved offline</span>
          </div>
          <ul className="mt-3 space-y-1">
            {CHECKLIST.map((c) => (
              <li key={c}>
                <label className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
                  <input type="checkbox" className="h-4 w-4 accent-primary" checked={done.includes(c)}
                    onChange={() => setDone(done.includes(c) ? done.filter((x) => x !== c) : [...done, c])} />
                  <span className={done.includes(c) ? "text-muted-foreground line-through" : ""}>{c}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-ink p-4 text-ink-foreground">
          <h2 className="text-lg font-bold">Helplines</h2>
          <p className="text-xs opacity-60">Tap to call · works without internet</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {HELPLINES.map((h) => (
              <li key={h.num}>
                <a href={`tel:${h.num}`} className="block rounded-lg bg-ink-foreground/10 p-3 hover:bg-ink-foreground/20">
                  <span className="block text-2xl font-bold">{h.num}</span>
                  <span className="text-xs opacity-70">{h.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
