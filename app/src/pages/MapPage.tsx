import type { GeoJsonObject } from "geojson";
import { NYCNeighborhoodMap } from "../components/NYCNeighborhoodMap";
import nycNeighborhoods from "../nyc_neighborhoods.json";
import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import {
  fetchNeighborhoodRentSeries,
  type RentSeriesResponse,
} from "../../hooks/useNeighborhoodRent";

export function MapPage() {
  const data = nycNeighborhoods as GeoJsonObject;

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [rentSeries, setRentSeries] = useState<RentSeriesResponse | null>(null);
  const [rentLoading, setRentLoading] = useState(false);
  const [rentError, setRentError] = useState<string | null>(null);

  const handleNeighborhoodClick = useCallback((neighborhood: string) => {
    setSelectedNeighborhood(neighborhood);
    setShowSidebar(true);
  }, []);

  useEffect(() => {
    if (!selectedNeighborhood) {
      setRentSeries(null);
      setRentError(null);
      return;
    }
    let cancelled = false;
    setRentLoading(true);
    setRentError(null);
    fetchNeighborhoodRentSeries(selectedNeighborhood)
      .then((series) => {
        if (!cancelled) setRentSeries(series);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setRentSeries(null);
          setRentError(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        if (!cancelled) setRentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedNeighborhood]);

  return (
    <div className="flex-1 relative isolate">
      <NYCNeighborhoodMap
        data={data}
        selectedNeighborhood={selectedNeighborhood}
        onNeighborhoodClick={handleNeighborhoodClick}
      />
      <Sidebar
        show={showSidebar}
        selectedNeighborhood={selectedNeighborhood}
        rentSeries={rentSeries}
        rentLoading={rentLoading}
        rentError={rentError}
        onClose={() => setShowSidebar(false)}
      />
    </div>
  );
}
