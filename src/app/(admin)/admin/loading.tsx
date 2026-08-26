export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      {/* Top Header Skeleton */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-admin-surface rounded" />
          <div className="h-4 w-72 bg-admin-surface/60 rounded" />
        </div>
        <div className="h-9 w-32 bg-admin-surface rounded" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-admin-surface border border-admin-border/40 space-y-3">
            <div className="h-3 w-20 bg-admin-content rounded" />
            <div className="h-8 w-28 bg-admin-content rounded" />
            <div className="h-3 w-16 bg-admin-content/60 rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-admin-surface border border-admin-border/40 rounded-lg space-y-4">
          <div className="h-5 w-36 bg-admin-content rounded" />
          <div className="h-64 bg-admin-content/40 rounded" />
        </div>
        <div className="p-5 bg-admin-surface border border-admin-border/40 rounded-lg space-y-4">
          <div className="h-5 w-28 bg-admin-content rounded" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-admin-content/40 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
