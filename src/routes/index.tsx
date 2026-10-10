import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TouristView } from "@/components/TouristView";
import { CommandCenter } from "@/components/CommandCenter";
import { seedState, uid, type AlertKind, type Beacon } from "@/lib/voyage-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafeVoyage — Real-time crisis communication for tourists" },
      { name: "description", content: "Translated extreme-weather alerts, safe-zone maps, SOS beacons and a responder command center." },
      { property: "og:title", content: "SafeVoyage — Real-time crisis communication for tourists" },
      { property: "og:description", content: "Translated extreme-weather alerts, safe-zone maps, SOS beacons and a responder command center." },
    ],
  }),
  component: App,
});

function App() {
  const [view, setView] = useState<"tourist" | "command">("tourist");
  const [dark, setDark] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [state, setState] = useState(() => seedState(Date.now()));
  const [sosSent, setSosSent] = useState(false);

  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(i); }, []);
  useEffect(() => { document.documentElement.classList.toggle("dark", dark); }, [dark]);

  const broadcast = (kind: AlertKind, sector: string) =>
    setState((s) => ({ ...s, alerts: [{ id: uid(), kind, sector, at: Date.now() }, ...s.alerts] }));
  const report = (text: string, location: string) =>
    setState((s) => ({ ...s, reports: [{ id: uid(), author: "You", text, location, official: false, at: Date.now() }, ...s.reports] }));
  const sos = () => {
    const b: Beacon = { id: uid(), name: "You (Tourist device)", lat: 15.556 + Math.random() * 0.02, lng: 73.755 + Math.random() * 0.02, at: Date.now(), status: "Needs Rescue", note: "Panic button pressed" };
    setState((s) => ({ ...s, beacons: [b, ...s.beacons] }));
    setSosSent(true);
  };
  const setStatus = (id: string, status: Beacon["status"]) =>
    setState((s) => ({ ...s, beacons: s.beacons.map((b) => (b.id === id ? { ...b, status } : b)) }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary font-display font-bold text-primary-foreground">SV</span>
            <div><p className="font-display font-bold leading-none">SafeVoyage</p><p className="text-xs text-muted-foreground">Crisis communication for tourists</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-muted p-1 text-sm font-medium" role="tablist">
              {([["tourist", "📱 Tourist App"], ["command", "🛰 Command Center"]] as const).map(([id, label]) => (
                <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}
                  className={`rounded-md px-3 py-1.5 ${view === id ? "bg-card text-primary shadow" : "text-muted-foreground"}`}>{label}</button>
              ))}
            </div>
            <button onClick={() => setDark(!dark)} aria-label="Toggle dark mode" className="rounded-lg border px-3 py-1.5 text-sm">{dark ? "☀" : "☾"}</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        {view === "tourist" ? (
          <TouristView alert={state.alerts[0]} reports={state.reports} now={now} onReport={report} onSOS={sos} sosSent={sosSent} />
        ) : (
          <CommandCenter alerts={state.alerts} beacons={state.beacons} now={now} devices={2847 + state.beacons.length} onBroadcast={broadcast} onStatus={setStatus} />
        )}
      </main>
    </div>
  );
}
