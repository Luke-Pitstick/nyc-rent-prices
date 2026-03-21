import { useCallback, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  ZoomControl,
  CircleMarker,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import type { GeoJsonObject, Feature, MultiPolygon, Polygon } from "geojson";
import area from "@turf/area";
import pointOnFeature from "@turf/point-on-feature";
import "leaflet/dist/leaflet.css";
import ntaToCanonical from "../ntaToCanonicalNeighborhood.json";

const NTA_TO_CANONICAL = ntaToCanonical as Record<string, string>;

function canonicalFromNta(ntaName: string): string {
  return NTA_TO_CANONICAL[ntaName] ?? ntaName;
}

/**
 * For MultiPolygon NTAs, Turf's point-on-whole-feature can land on a tiny pier sliver
 * (wrong borough). Anchor labels to the largest polygon by area instead.
 */
function geometryForNeighborhoodLabel(feature: Feature): Feature {
  const g = feature.geometry;
  if (!g || g.type !== "MultiPolygon") return feature;

  const mp = g as MultiPolygon;
  let best: Polygon | null = null;
  let bestArea = -1;
  for (const coords of mp.coordinates) {
    const poly: Polygon = { type: "Polygon", coordinates: coords };
    const a = area({ type: "Feature", properties: {}, geometry: poly });
    if (a > bestArea) {
      bestArea = a;
      best = poly;
    }
  }
  if (!best || bestArea <= 0) return feature;

  return {
    type: "Feature",
    properties: feature.properties,
    geometry: best,
  };
}

/** Label anchor inside/on the polygon (MultiPolygon → largest part only). */
function neighborhoodTooltipLatLng(feature: Feature): L.LatLng | null {
  try {
    if (!feature.geometry) return null;
    const f = geometryForNeighborhoodLabel(feature);
    const pt = pointOnFeature(f);
    const c = pt.geometry.coordinates;
    if (c.length < 2) return null;
    const lng = Number(c[0]);
    const lat = Number(c[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return L.latLng(lat, lng);
  } catch {
    return null;
  }
}

/** Approximate label anchor points (not official centroids). */
const BOROUGH_MARKERS: { name: string; center: [number, number] }[] = [
  { name: "Manhattan", center: [40.7831, -73.9712] },
  { name: "Brooklyn", center: [40.6782, -73.9442] },
  { name: "Queens", center: [40.7282, -73.7949] },
  { name: "Bronx", center: [40.8448, -73.8648] },
  { name: "Staten Island", center: [40.5795, -74.1502] },
];

function BoroughNameMarkers() {
  return (
    <>
      {BOROUGH_MARKERS.map(({ name, center }) => (
        <CircleMarker
          key={name}
          center={center}
          radius={1}
          interactive={false}
          pathOptions={{
            opacity: 0,
            fillOpacity: 0,
            weight: 0,
          }}
        >
          <Tooltip permanent direction="center" className="borough-label">
            {name}
          </Tooltip>
        </CircleMarker>
      ))}
    </>
  );
}

/** Toggles classes on the Leaflet root so CSS can show/hide labels by zoom. */
function MapZoomSync({
  minZoomBorough = 10,
  minZoomNeighborhood = 13,
}: {
  minZoomBorough?: number;
  minZoomNeighborhood?: number;
}) {
  const map = useMap();

  const sync = useCallback(() => {
    const el = map.getContainer();
    const z = map.getZoom();
    const showBorough = z >= minZoomBorough && z < minZoomNeighborhood;
    const showNeighborhood = z >= minZoomNeighborhood;
    el.classList.toggle("map-show-borough-labels", showBorough);
    el.classList.toggle("map-show-neighborhood-labels", showNeighborhood);
    for (const c of Array.from(el.classList)) {
      if (c.startsWith("map-zoom-")) el.classList.remove(c);
    }
    const tier = Math.min(18, Math.max(10, Math.floor(z)));
    el.classList.add(`map-zoom-${tier}`);
  }, [map, minZoomBorough, minZoomNeighborhood]);

  useEffect(() => {
    sync();
  }, [sync]);

  useMapEvents({
    zoomend: sync,
  });

  return null;
}

function getBoroughColor(borough: string) {
  switch (borough) {
    case "Manhattan":
      return "#8b5cf6";
    case "Bronx":
      return "#84cc16";
    case "Brooklyn":
      return "#3b82f6";
    case "Queens":
      return "#ef4444";
    case "Staten Island":
      return "#f97316";
    default:
      return "#cccccc";
  }
}

function neighborhoodPolygonStyle(
  feature: Feature | undefined,
  selectedCanonical: string | null,
): L.PathOptions {
  const borough = String(feature?.properties?.BoroName ?? "");
  const fillColor = getBoroughColor(borough);
  const nta = String(feature?.properties?.NTAName ?? "");
  const canonical = canonicalFromNta(nta);
  const isSelected = selectedCanonical != null && canonical === selectedCanonical;

  return {
    fillColor,
    weight: isSelected ? 3 : 1,
    opacity: 1,
    color: isSelected ? "#4c1d95" : "white",
    fillOpacity: isSelected ? 0.82 : 0.5,
  };
}

export type NYCNeighborhoodMapProps = {
  data: GeoJsonObject;
  minZoomBorough?: number;
  minZoomNeighborhood?: number;
  /** Canonical neighborhood name; matching polygons are highlighted on the map. */
  selectedNeighborhood?: string | null;
  onNeighborhoodClick?: (neighborhood: string) => void;
};

export function NYCNeighborhoodMap({
  data,
  minZoomBorough = 10,
  minZoomNeighborhood = 13,
  selectedNeighborhood = null,
  onNeighborhoodClick,
}: NYCNeighborhoodMapProps) {
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  const mapPolygonStyle = useCallback(
    (feature?: Feature) => neighborhoodPolygonStyle(feature, selectedNeighborhood),
    [selectedNeighborhood],
  );

  const onEachNeighborhood = useCallback(
    (feature: Feature, layer: L.Layer) => {
      if (feature.properties && feature.properties.NTAName) {
        const label = canonicalFromNta(String(feature.properties.NTAName));
        layer.bindTooltip(label, {
          permanent: true,
          direction: "center",
          className: "neighborhood-label",
        });
        const latLng = neighborhoodTooltipLatLng(feature);
        if (latLng) {
          layer.getTooltip()?.setLatLng(latLng);
        }
      }
      layer.on({
        click: () => {
          const nta = String(feature.properties?.NTAName ?? "");
          onNeighborhoodClick?.(canonicalFromNta(nta));
        },
      });
    },
    [onNeighborhoodClick],
  );

  /** Every matching NTA must be raised above neighbors, or outer edges stay under adjacent polygons. */
  useEffect(() => {
    if (selectedNeighborhood == null) return;
    const id = requestAnimationFrame(() => {
      const group = geoJsonRef.current;
      if (!group) return;
      group.eachLayer((layer) => {
        const f = (layer as L.Layer & { feature?: Feature }).feature;
        const nta = f?.properties?.NTAName;
        if (nta == null) return;
        if (canonicalFromNta(String(nta)) !== selectedNeighborhood) return;
        (layer as L.Path).bringToFront();
      });
    });
    return () => cancelAnimationFrame(id);
  }, [selectedNeighborhood]);

  return (
    <MapContainer
      center={[40.7128, -74.006]}
      zoom={11}
      minZoom={10}
      maxZoom={18}
      scrollWheelZoom
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full absolute inset-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="topright" />
      <MapZoomSync
        minZoomBorough={minZoomBorough}
        minZoomNeighborhood={minZoomNeighborhood}
      />
      <BoroughNameMarkers />
      <GeoJSON
        ref={geoJsonRef}
        data={data}
        style={mapPolygonStyle}
        onEachFeature={onEachNeighborhood}
      />
    </MapContainer>
  );
}
