export function AboutPage() {
  return (
    <main className="flex-1 p-4 min-h-0 overflow-auto">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">About NYC Rent Prices</h1>
        <p className="text-gray-700 mb-4">
          This interactive map visualizes rent prices across New York City neighborhoods.
          Explore different areas to understand rental trends and compare prices across boroughs.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Data Sources</h2>
        <p className="text-gray-700 mb-4">
          The data displayed on this map is sourced from publicly available NYC housing data
          and is updated regularly to reflect current market conditions.
        </p>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Map &amp; tiles</h2>
        <div className="mb-6 rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50/90 to-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Map credits
          </p>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
              <span className="shrink-0 text-gray-500">Map library</span>
              <a
                href="https://leafletjs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-emerald-200/80 transition hover:bg-emerald-50/80 hover:ring-emerald-300/80"
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded bg-emerald-600 text-[10px] font-bold text-white"
                  aria-hidden
                >
                  L
                </span>
                Leaflet
              </a>
            </li>
            <li className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-3">
              <span className="shrink-0 text-gray-500">Basemap tiles</span>
              <span className="text-gray-700 leading-relaxed">
                ©{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 transition hover:decoration-gray-500"
                >
                  OpenStreetMap
                </a>{" "}
                contributors · ©{" "}
                <a
                  href="https://carto.com/attributions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 transition hover:decoration-gray-500"
                >
                  CARTO
                </a>
              </span>
            </li>
          </ul>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">How to Use</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Navigate the map using zoom controls or scroll</li>
          <li>Click on neighborhoods to see detailed rent information</li>
          <li>Use the legend to understand price ranges</li>
        </ul>
      </div>
    </main>
  );
}