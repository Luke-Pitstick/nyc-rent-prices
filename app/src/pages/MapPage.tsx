import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-zoom";

export function MapPage() {
  return (
    <main id="map" className="flex-1 p-4 min-h-0">
      <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-gray-200">
        <arcgis-map item-id="9f7fdb7c80e046f8822f4c2756f0659d">
          <arcgis-zoom slot="top-left" />
        </arcgis-map>
      </div>
    </main>
  );
}
