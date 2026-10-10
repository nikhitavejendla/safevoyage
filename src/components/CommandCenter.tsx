import { ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ALERT_TEMPLATES, SECTORS, ago, type Alert, type AlertKind, type Beacon } from "@/lib/voyage-data";
import { supabase, toAlert, toBeacon, type AlertRow, type BeaconRow } from "@/lib/supabase";

const CrisisMap = lazy(() => import("./CrisisMap"));

// alerts/beacons now come from Supabase, so only `now` and `devices` remain as props.
type Props = { now: number; devices: number };

export function CommandCenter({ now, devices }: Props) {
  const [kind, setKind] = useState<AlertKind>("flood");
  const [sector, setSector] = useState<string>(SECTORS[3] ?? "Sector 4");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [beacons, setBeacons] = useState<Beacon[]>([]);
  const rescue = beacons.filter((b) => b.status === "Needs Rescue").length;

  /* Initial load + realtime subscriptions */
  useEffect(() => {
    let active = true;

    (async () => {
      const [a, b] = await Promise.all([
        supabase.from("alerts").select("*").order("created_at", { ascending: false }).limit(20),
        supabase.from("sos_beacons").select("*").order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (a.error) console.error("alerts load:", a.error.message);
      if (b.error) console.error("sos_beacons load:", b.error.message);
      setAlerts(((a.data ?? []) as AlertRow[]).map(toAlert));
      setBeacons(((b.data ?? []) as BeaconRow[]).map(toBeacon));
    })();

    const channel = supabase
      .channel("command-center")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sos_beacons" }, (p) => {
        const nb = toBeacon(p.new as BeaconRow);
        setBeacons((prev) => (prev.some((x) => x.id === nb.id) ? prev : [nb, ...prev]));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "sos_beacons" }, (p) => {
        const ub = toBeacon(p.new as BeaconRow);
        setBeacons((prev) => prev.map((x) => (x.id === ub.id ? ub : x)));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (p) => {
        const na = toAlert(p.new as AlertRow);
        setAlerts((prev) => (prev.some((x) => x.id === na.id) ? prev : [na, ...prev]));
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const broadcast = async () => {
    setError(null);
    const { error } = await supabase.from("alerts").insert({ kind, sector });
    if (error) return setError(error.message);
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  const setStatus = async (id: string, status: Beacon["status"]) => {
    const prev = beacons;
    setBeacons((bs) => bs.map((b) => (b.id === id ? { ...b, status } : b))); // optimistic
    const { error } = await supabase.from("sos_beacons").update({ status }).eq("id", id);
    if (error) {
      setBeacons(prev);
      setError(error.message);
    }
  };

  const stats = [
    { label: "Connected devices", value: devices.toLocaleString(), tone: "text-primary" },
    { label: "Needs rescue", value: rescue, tone: "text-danger" },
    { label: "Marked safe", value: beacons.length - rescue, tone: "text-safe" },
    { label: "Active alerts", value: alerts.length, tone: "text-emergency" },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className={`mt-1 font-display text-3xl font-bold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {error && <p role="alert" className="rounded-lg bg-danger/10 p-2 text-sm text-danger">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-4 lg:col-span-2">
          <h2 className="font-bold">Live incident map</h2>
          <div className="relative z-0 mt-3 h-[380px] overflow-hidden rounded-xl bg-muted">
            <ClientOnly fallback={null}>
              <Suspense fallback={null}>
                <CrisisMap filters={{ shelter: true, medical: true, routes: true }} beacons={beacons} />
              </Suspense>
            </ClientOnly>
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-4">
          <h2 className="font-bold">Dispatcher panel</h2>
          <p className="text-xs text-muted-foreground">Broadcast to all connected tourist devices</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(Object.keys(ALERT_TEMPLATES) as AlertKind[]).map((k) => (
              <button
                key={k}
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${kind === k ? "border-primary bg-primary/10 text-primary" : ""}`}
              >
                {ALERT_TEMPLATES[k].label}
              </button>
            ))}
          </div>
          <select value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Sector" className="mt-2 w-full rounded-lg border bg-background px-3 py-2 text-sm">
            {SECTORS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <p className="mt-2 rounded-lg bg-muted p-2 text-xs">
            {ALERT_TEMPLATES[kind].text.en.replace("{s}", sector)}
            <br />
            <span className="text-muted-foreground">Auto-translated into 5 languages</span>
          </p>
          <button onClick={broadcast} className="mt-3 w-full rounded-lg bg-danger py-3 font-bold text-on-color hover:brightness-110">
            {sent ? "✓ Broadcast sent" : "📢 Broadcast alert"}
          </button>
          <h3 className="mt-4 text-sm font-bold">Recent broadcasts</h3>
          <ul className="mt-1 space-y-1 text-xs">
            {alerts.slice(0, 4).map((a) => (
              <li key={a.id} className="flex justify-between">
                <span>{ALERT_TEMPLATES[a.kind].label} · {a.sector}</span>
                <span className="text-muted-foreground">{ago(a.at, now)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl border bg-card p-4">
        <h2 className="font-bold">Incoming SOS beacons</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr><th className="py-2">Tourist</th><th>Status</th><th>Received</th><th>GPS</th><th>Note</th><th></th></tr>
            </thead>
            <tbody>
              {beacons.length === 0 && (
                <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No SOS beacons yet</td></tr>
              )}
              {beacons.map((b) => (
                <tr key={b.id} className="border-t">
                  <td className="py-3 font-medium">{b.name}</td>
                  <td>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-on-color ${b.status === "Safe" ? "bg-safe" : "bg-danger"}`}>{b.status}</span>
                  </td>
                  <td className="text-muted-foreground">
                    {new Date(b.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {ago(b.at, now)}
                  </td>
                  <td className="font-mono text-xs">{b.lat.toFixed(4)}, {b.lng.toFixed(4)}</td>
                  <td className="text-muted-foreground">{b.note}</td>
                  <td className="text-right">
                    <button
                      onClick={() => setStatus(b.id, b.status === "Safe" ? "Needs Rescue" : "Safe")}
                      className="rounded-md border px-2 py-1 text-xs font-medium hover:bg-muted"
                    >
                      {b.status === "Safe" ? "Reopen" : "Mark safe"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
