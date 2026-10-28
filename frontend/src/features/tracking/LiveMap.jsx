import { useEffect, useMemo, useRef, useState } from 'react';
import { Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import BaseMap, { FitBounds, FollowPoint, HomeMarker, RouteLines } from '../../components/maps/BaseMap';
import { useMode } from '../../hooks/useAccount';

/** Recenter control rendered inside the map container */
function RecenterButton({ points, className = '', onRecenter }) {
  const map = useMap();
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
      L.DomEvent.disableScrollPropagation(ref.current);
    }
  }, []);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => {
        onRecenter?.();
        if (points?.length) map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 16 });
      }}
      aria-label="Centralizar mapa no passeio"
      className={`absolute z-[500] flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink-900 shadow-float transition hover:bg-cream-50 active:scale-95 ${className}`}
    >
      <LocateFixed size={20} aria-hidden="true" />
    </button>
  );
}

/**
 * Walker avatar marker with a memoized icon, so the pulse animation isn't
 * restarted on every simulated position update.
 */
function WalkerMarker({ position, avatar, live, color }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: 'rdp-marker',
        html: `<div style="position:relative;transform:translate(-50%,-50%);width:50px;height:50px">
          ${live ? `<span style="position:absolute;inset:0;border-radius:999px;background:${color}55;animation:pulse-ring 1.8s ease-out infinite"></span>` : ''}
          <img src="${avatar || ''}" alt="" style="position:relative;width:50px;height:50px;border-radius:999px;border:3px solid #F9A825;object-fit:cover;background:#F7EDE2;box-shadow:0 4px 14px rgba(45,27,20,.35)" onerror="this.style.visibility='hidden'"/>
        </div>`,
        iconSize: [0, 0],
      }),
    [avatar, live, color],
  );
  return <Marker position={position} icon={icon} zIndexOffset={2000} keyboard={false} />;
}

/** Keeps Leaflet's size in sync with layout changes (sheet/panel resizes) */
function SizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 80);
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(id);
      window.removeEventListener('resize', onResize);
    };
  }, [map]);
  return null;
}

/**
 * Full-bleed tracking map: home, planned route (dashed), traveled path (solid,
 * mode accent) and the walker's avatar marker. Positions are simulated.
 */
export default function LiveMap({ live, interactive = true, recenterClassName = 'right-4 top-24', showRecenter = true, className = '' }) {
  const { isWalkerMode } = useMode();
  const [follow, setFollow] = useState(true);
  if (!live?.booking) return null;
  const { routes, point, traveled, planned, phase, isMoving, booking } = live;
  const home = [routes.home.lat, routes.home.lng];
  const fitPoints = [...planned, point, home];
  const color = isWalkerMode ? '#B8860B' : '#7A2145';

  return (
    <div className={`relative h-full w-full ${className}`} onPointerDown={() => isMoving && setFollow(false)}>
      <BaseMap center={routes.home} zoom={15} interactive={interactive} zoomControl={false}>
        <SizeWatcher />
        <FitBounds points={fitPoints} fitKey={`${booking.id}-${phase}`} padding={56} />
        <FollowPoint point={point} enabled={isMoving && follow} />
        <RouteLines planned={planned} traveled={traveled} color={color} />
        <HomeMarker position={home} />
        {phase !== 'closed' ? <WalkerMarker position={point} avatar={booking.walker?.avatar} live={isMoving} color={color} /> : null}
        {showRecenter && interactive ? (
          <RecenterButton points={fitPoints} className={recenterClassName} onRecenter={() => setFollow(true)} />
        ) : null}
      </BaseMap>
    </div>
  );
}
