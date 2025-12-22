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
