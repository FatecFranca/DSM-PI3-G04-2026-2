import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { formatBRL } from '../../utils/format';

// Map building blocks on top of Leaflet + OpenStreetMap tiles (softened via CSS to match the brand).
// Swap the TileLayer for a commercial provider (Google/Mapbox) in production.

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const SAO_PAULO = { lat: -23.5733, lng: -46.6588 };

export default function BaseMap({ center = SAO_PAULO, zoom = 13, children, className = '', interactive = true, zoomControl = true }) {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className={`h-full w-full ${className}`}
      zoomControl={zoomControl}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      touchZoom={interactive}
      attributionControl
    >
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
      {children}
    </MapContainer>
  );
}

/** Fits the map to a list of [lat, lng] points whenever `key` changes */
export function FitBounds({ points, padding = 40, fitKey, maxZoom = 16 }) {
  const map = useMap();
  useEffect(() => {
    if (!points?.length) return;
    if (points.length === 1) map.setView(points[0], Math.min(15, maxZoom));
    else map.fitBounds(L.latLngBounds(points), { padding: [padding, padding], maxZoom });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, fitKey]);
  return null;
}

/** Smoothly keeps a point in view (used while tracking) */
export function FollowPoint({ point, enabled = true }) {
  const map = useMap();
  useEffect(() => {
    if (!enabled || !point) return;
    if (!map.getBounds().pad(-0.25).contains(point)) map.panTo(point, { animate: true, duration: 0.8 });
  }, [map, point, enabled]);
  return null;
}

/** Invalidate size when the container becomes visible (e.g. list ↔ map toggle) */
export function InvalidateOnShow({ visible }) {
  const map = useMap();
  useEffect(() => {
    if (visible) setTimeout(() => map.invalidateSize(), 50);
  }, [map, visible]);
  return null;
}

const priceIcon = (price, active) =>
  L.divIcon({
    className: 'rdp-marker',
    html: `<div style="transform:translate(-50%,-50%);display:inline-block;white-space:nowrap;padding:6px 10px;border-radius:999px;font:700 13px/1 'Plus Jakarta Sans Variable',sans-serif;box-shadow:0 2px 10px rgba(45,27,20,.25);transition:all .15s;${
      active ? 'background:#2D1B14;color:#fff;transform:translate(-50%,-50%) scale(1.12);' : 'background:#fff;color:#2D1B14;border:1px solid #E8D5C4;'
    }">${formatBRL(price).replace(',00', '')}</div>`,
    iconSize: [0, 0],
  });

export function PriceMarker({ position, price, active, onClick }) {
  return <Marker position={position} icon={priceIcon(price, active)} eventHandlers={{ click: onClick }} zIndexOffset={active ? 1000 : 0} keyboard />;
}

const avatarIcon = (avatar, live) =>
  L.divIcon({
    className: 'rdp-marker',
    html: `<div style="position:relative;transform:translate(-50%,-50%);width:48px;height:48px">
      ${live ? '<span style="position:absolute;inset:0;border-radius:999px;background:rgba(249,168,37,.45);animation:pulse-ring 1.8s ease-out infinite"></span>' : ''}
      <img src="${avatar}" alt="" style="position:relative;width:48px;height:48px;border-radius:999px;border:3px solid #F9A825;object-fit:cover;background:#F7EDE2;box-shadow:0 4px 14px rgba(45,27,20,.35)" onerror="this.style.visibility='hidden'"/>
    </div>`,
    iconSize: [0, 0],
  });

export function WalkerPositionMarker({ position, avatar, live = true }) {
  return <Marker position={position} icon={avatarIcon(avatar, live)} zIndexOffset={2000} />;
}

const homeIcon = L.divIcon({
  className: 'rdp-marker',
  html: `<div style="transform:translate(-50%,-50%);width:34px;height:34px;border-radius:12px;background:#7A2145;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(45,27,20,.35);border:2px solid #fff">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>
  </div>`,
  iconSize: [0, 0],
});

export function HomeMarker({ position }) {
  return <Marker position={position} icon={homeIcon} />;
}

const dotIcon = (color) =>
  L.divIcon({
    className: 'rdp-marker',
    html: `<div style="transform:translate(-50%,-50%);width:14px;height:14px;border-radius:999px;background:${color};border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.3)"></div>`,
    iconSize: [0, 0],
  });

export function DotMarker({ position, color = '#2D1B14' }) {
  return <Marker position={position} icon={dotIcon(color)} />;
}

/** Planned route (dashed) + traveled path (solid) */
export function RouteLines({ planned, traveled, color = '#7A2145' }) {
  return (
    <>
      {planned?.length ? <Polyline positions={planned} pathOptions={{ color: '#2D1B14', weight: 4, opacity: 0.25, dashArray: '2 10', lineCap: 'round' }} /> : null}
      {traveled?.length > 1 ? (
        <>
          <Polyline positions={traveled} pathOptions={{ color: '#fff', weight: 9, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} />
          <Polyline positions={traveled} pathOptions={{ color, weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }} />
        </>
      ) : null}
    </>
  );
}
