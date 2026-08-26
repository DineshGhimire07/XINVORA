export default function ProductsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-admin-surface rounded" />
          <div className="h-4 w-72 bg-admin-surface/60 rounded" />
        </div>
        <div className="h-9 w-36 bg-admin-surface rounded" />
      </div>

      <div className="p-4 rounded-lg bg-admin-surface border border-admin-border/40 flex justify-between">
        <div className="h-9 max-w-md w-full bg-admin-content rounded" />
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-admin-content rounded" />
          <div className="h-9 w-28 bg-admin-content rounded" />
        </div>
      </div>

      <div className="bg-admin-surface border border-admin-border/40 rounded-lg overflow-hidden p-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-14 bg-admin-content/50 rounded flex items-center justify-between px-4">
            <div className="h-10 w-8 bg-admin-surface rounded" />
            <div className="h-4 w-48 bg-admin-surface rounded" />
            <div className="h-4 w-20 bg-admin-surface rounded" />
            <div className="h-4 w-24 bg-admin-surface rounded" />
            <div className="h-4 w-16 bg-admin-surface rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
