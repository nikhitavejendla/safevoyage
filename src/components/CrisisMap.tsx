import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Polygon, Tooltip, CircleMarker } from "react-leaflet";
import { FLOOD_ZONES, ROUTES, type Beacon } from "@/lib/voyage-data";
import { supabase, type SpotRow } from "@/lib/supabase";

export type Filters = { shelter: boolean; medical: boolean; routes: boolean };
const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export default function CrisisMap({ filters, beacons = [] }: { filters: Filters; beacons?: Beacon[] }) {
  const [spots, setSpots] = useState<SpotRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("spots")
      .select("id,name,kind,lat,lng,note")
      .then(({ data, error }) => {
        if (error) return console.error("Failed to load spots:", error.message);
        if (!cancelled) setSpots((data ?? []) as SpotRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const c = { danger: css("--danger"), safe: css("--safe"), route: css("--emergency"), blue: css("--primary") };
  const color = (k: string) => (k === "shelter" ? c.safe : k === "medical" ? c.blue : c.safe);

  return (
    <MapContainer center={[15.56, 73.775]} zoom={13} scrollWheelZoom className="h-full w-full">
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {FLOOD_ZONES.map((f) => (
        <Polygon key={f.name} positions={f.points} pathOptions={{ color: c.danger, fillColor: c.danger, fillOpacity: 0.4 }}>
          <Tooltip>⚠ {f.name}</Tooltip>
        </Polygon>
      ))}
      {filters.routes &&
        ROUTES.map((r) => (
          <Polyline key={r.name} positions={r.points} pathOptions={{ color: c.route, weight: 5, dashArray: "8 8" }}>
            <Tooltip>➜ {r.name}</Tooltip>
          </Polyline>
        ))}
      {spots
        .filter((p) => p.kind === "embassy" || filters[p.kind])
        .map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={9}
            pathOptions={{ color: color(p.kind), fillColor: color(p.kind), fillOpacity: 0.9 }}
          >
            <Tooltip>
              {p.kind === "medical" ? "✚" : p.kind === "embassy" ? "🏛" : "⌂"} {p.name}
              {p.note ? ` · ${p.note}` : ""}
            </Tooltip>
          </CircleMarker>
        ))}
      {beacons.map((b) => (
        <CircleMarker
          key={b.id}
          center={[b.lat, b.lng]}
          radius={7}
          pathOptions={{
            color: b.status === "Safe" ? c.safe : c.danger,
            fillColor: b.status === "Safe" ? c.safe : c.danger,
            fillOpacity: 1,
          }}
        >
          <Tooltip>
            SOS · {b.name} · {b.status}
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
