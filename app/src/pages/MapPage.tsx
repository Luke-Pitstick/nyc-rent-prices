import type { GeoJsonObject } from "geojson";
import { NYCNeighborhoodMap } from "../components/NYCNeighborhoodMap";
import nycNeighborhoods from "../nyc_neighborhoods.json";
import { useCallback, useState } from "react";
import { Sidebar } from "@/components/Sidebar";

export function MapPage() {
  const data = nycNeighborhoods as GeoJsonObject;

  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleNeighborhoodClick = useCallback((neighborhood: string) => {
    setSelectedNeighborhood(neighborhood);
    setShowSidebar(true);
  }, [setSelectedNeighborhood]);

  return (
    <div className="flex-1 relative isolate">
      <NYCNeighborhoodMap data={data} onNeighborhoodClick={handleNeighborhoodClick} />
      <Sidebar
        show={showSidebar}
        selectedNeighborhood={selectedNeighborhood}
        onClose={() => setShowSidebar(false)}
      />
    </div>
  );
}
