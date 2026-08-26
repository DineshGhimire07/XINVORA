export default function InventoryLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-admin-surface rounded" />
          <div className="h-4 w-80 bg-admin-surface/60 rounded" />
        </div>
        <div className="h-9 w-40 bg-admin-surface rounded" />
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-admin-surface border border-admin-border/40 space-y-2">
            <div className="h-3 w-24 bg-admin-content rounded" />
            <div className="h-8 w-16 bg-admin-content rounded" />
            <div className="h-3 w-20 bg-admin-content/60 rounded" />
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-lg bg-admin-surface border border-admin-border/40 space-y-3">
        <div className="flex justify-between gap-4">
          <div className="h-9 max-w-md w-full bg-admin-content rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-admin-content rounded" />
            <div className="h-9 w-36 bg-admin-content rounded" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-admin-surface border border-admin-border/40 rounded-lg overflow-hidden p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-12 bg-admin-content/50 rounded flex items-center justify-between px-4">
            <div className="h-4 w-4 bg-admin-surface rounded" />
            <div className="h-4 w-48 bg-admin-surface rounded" />
            <div className="h-4 w-32 bg-admin-surface rounded" />
            <div className="h-4 w-16 bg-admin-surface rounded" />
            <div className="h-4 w-12 bg-admin-surface rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
