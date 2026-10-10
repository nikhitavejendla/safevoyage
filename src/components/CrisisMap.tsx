import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, Polyline, Polygon, Tooltip, CircleMarker } from "react-leaflet";
import { FLOOD_AREAS, SAFE_ZONES, ROUTES, type Layer } from "@/lib/crisis-data";

const css = (v: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

export default function CrisisMap({ layers }: { layers: Record<Layer, boolean> }) {
  const danger = css("--danger"), safe = css("--safe"), route = css("--primary");
  return (
    <MapContainer center={[15.55, 73.76]} zoom={13} scrollWheelZoom className="h-full w-full">
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {layers.flood && FLOOD_AREAS.map((f) => (
        <Polygon key={f.name} positions={f.points} pathOptions={{ color: danger, fillColor: danger, fillOpacity: 0.35 }}>
          <Tooltip>⚠ {f.name} — {f.note}</Tooltip>
        </Polygon>
      ))}
      {layers.routes && ROUTES.map((r) => (
        <Polyline key={r.name} positions={r.points} pathOptions={{ color: route, weight: 5, dashArray: "8 8" }}>
          <Tooltip>➜ {r.name}</Tooltip>
        </Polyline>
      ))}
      {layers.safe && SAFE_ZONES.map((s) => (
        <span key={s.name}>
          <Circle center={s.pos} radius={250} pathOptions={{ color: safe, fillColor: safe, fillOpacity: 0.25 }} />
          <CircleMarker center={s.pos} radius={7} pathOptions={{ color: safe, fillColor: safe, fillOpacity: 1 }}>
            <Tooltip>✚ {s.name} · {s.cap}</Tooltip>
          </CircleMarker>
        </span>
      ))}
    </MapContainer>
  );
}
