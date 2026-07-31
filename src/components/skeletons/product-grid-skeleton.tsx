import { Skeleton } from "@/components/ui/skeleton"

interface ProductGridSkeletonProps {
  count?: number
  showHeader?: boolean
}

export function ProductGridSkeleton({ count = 8, showHeader = true }: ProductGridSkeletonProps) {
  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Optional Header & Toolbar Skeleton */}
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F2EFEA] pb-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-[#EAE6DF]" />
            <Skeleton className="h-7 w-48 bg-[#E2DDD5]" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-28 bg-[#EAE6DF] rounded-sm" />
            <Skeleton className="h-9 w-36 bg-[#EAE6DF] rounded-sm" />
          </div>
        </div>
      )}

      {/* Responsive Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 group">
            {/* Product Image Aspect-Ratio Container Skeleton */}
            <div className="aspect-[3/4] w-full rounded-md bg-[#FAF8F5] overflow-hidden relative">
              <Skeleton className="w-full h-full bg-[#EAE6DF]" />
            </div>

            {/* Product Details Skeleton */}
            <div className="space-y-2 pt-1">
              <Skeleton className="h-3 w-16 bg-[#EAE6DF]" />
              <Skeleton className="h-4 w-5/6 bg-[#E2DDD5]" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-4 w-20 bg-[#E2DDD5]" />
                <Skeleton className="h-3 w-12 bg-[#EAE6DF]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
