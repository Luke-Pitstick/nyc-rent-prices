type SidebarProps = {
  show: boolean;
  selectedNeighborhood: string | null;
  onClose?: () => void;
};

export function Sidebar({ show, selectedNeighborhood, onClose }: SidebarProps) {
  if (!show) return null;

  return (
    <aside
      className="absolute inset-y-0 right-0 z-[1000] flex w-full max-w-sm flex-col border-l border-gray-200/80 bg-white/95 shadow-[-12px_0_40px_-12px_rgba(15,23,42,0.15)] backdrop-blur-sm"
      aria-label="Neighborhood details"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Selected area
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-snug text-gray-900">
            {selectedNeighborhood ?? "—"}
          </h2>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close panel"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
        <section>
          <h3 className="text-sm font-medium text-gray-500">Median rent</h3>
          <div className="mt-3 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white px-4 py-5">
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-gray-900">
              $2,000
              <span className="ml-1 text-base font-medium text-gray-400">/ mo</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Placeholder estimate. Wire this to your model or API when ready.
            </p>
          </div>
        </section>

        <section className="rounded-xl bg-violet-50/80 px-4 py-3 text-xs leading-relaxed text-violet-900/90">
          <span className="font-semibold text-violet-950">Tip:</span> Click another neighborhood on the map
          to compare.
        </section>
      </div>
    </aside>
  );
}
