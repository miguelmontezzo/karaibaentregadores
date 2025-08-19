import { useEffect, useMemo, useRef, useState } from "react";
import L, { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

async function geocode(address: string) {
  // geocode.maps.co (direto) com API key — conforme documentação fornecida
  try {
    const key = (import.meta as any).env?.VITE_GEOCODE_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('GEOCODE_API_KEY') : undefined);
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(address)}${key ? `&api_key=${encodeURIComponent(key)}` : ""}`;
    const res = await fetch(url, { headers: { "Accept-Language": "pt-BR" } });
    if (res.ok) {
      const data = await res.json();
      const item = Array.isArray(data) ? data[0] : data?.[0] ?? data;
      if (item && item.lat && item.lon) {
        return { lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
      }
    }
  } catch {}
  return null;
}

type MiniRouteMapProps = {
  destinationAddress: string;
  originAddress?: string; // padrão: Karaíba Uberlândia
  height?: number;
};

export default function MiniRouteMap({
  destinationAddress,
  originAddress = "Restaurante Karaíba, Uberlândia - MG",
  height = 200,
}: MiniRouteMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routingRef = useRef<any>(null);
  const [coords, setCoords] = useState<{ o?: LatLngExpression; d?: LatLngExpression }>({});
  const fallbackOrigin: LatLngExpression = [-18.9186, -48.2772];
  const [loading, setLoading] = useState<boolean>(true);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const sanitize = (s: string) =>
        s
          .replace(/\b(apto|ap|apt|ap\.|apt\.|apartmento|apartment|bloco|bl|bl\.)\b[^,]*/gi, "")
          .replace(/\s+/g, " ")
          .trim();
      const [o, d] = await Promise.all([
        geocode(sanitize(originAddress)),
        geocode(sanitize(destinationAddress)),
      ]);
      if (cancelled) return;
      if (o && d) {
        setCoords({ o: [o.lat, o.lon], d: [d.lat, d.lon] });
        setEmbedUrl(null);
      } else {
        // Fallback: exibir rota via Google Maps embed para não ficar em branco
        const saddr = encodeURIComponent(originAddress);
        const daddr = encodeURIComponent(destinationAddress);
        setEmbedUrl(`https://www.google.com/maps?output=embed&saddr=${saddr}&daddr=${daddr}`);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [originAddress, destinationAddress]);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false as any,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);
      mapRef.current.setView(fallbackOrigin as any, 12);
    }

    if (coords.o && coords.d) {
      if (routingRef.current) {
        mapRef.current?.removeControl(routingRef.current);
        routingRef.current = null;
      }
      routingRef.current = (L as any).Routing.control({
        waypoints: [L.latLng(coords.o as any), L.latLng(coords.d as any)],
        lineOptions: {
          addWaypoints: false,
          styles: [{ color: "#7a0f12", weight: 5, opacity: 0.95 }],
        },
        show: false,
        collapsible: false,
        fitSelectedRoutes: true,
        router: (L as any).Routing.osrmv1({ serviceUrl: "https://router.project-osrm.org/route/v1" }),
        createMarker: () => null,
      }).addTo(mapRef.current);
      try {
        const group = L.featureGroup([L.marker(coords.o as any), L.marker(coords.d as any)]);
        mapRef.current.fitBounds(group.getBounds(), { padding: [16, 16] });
      } catch {}
    }

    return () => {
      if (routingRef.current) {
        mapRef.current?.removeControl(routingRef.current);
        routingRef.current = null;
      }
    };
  }, [coords.o, coords.d]);

  const style = useMemo(
    () => ({ width: "100%", height: `${height}px`, borderRadius: 12, overflow: "hidden" as const }),
    [height]
  );

  if (embedUrl) {
    return (
      <iframe
        title="Rota"
        src={embedUrl}
        width="100%"
        height={height}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0, borderRadius: 12 }}
      />
    );
  }

  if (loading || !coords.o || !coords.d) {
    return (
      <div style={style} className="bg-muted/40 flex items-center justify-center text-xs text-muted-foreground">
        Carregando mapa...
      </div>
    );
  }

  return <div ref={containerRef} style={style} />;
}

