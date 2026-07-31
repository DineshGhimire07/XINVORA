import { Skeleton } from "@/components/ui/skeleton"
import { Stack } from "@/components/shared/stack"

export function OrdersSkeleton() {
  return (
    <Stack gap={6} className="animate-in fade-in-50 duration-300">
      {/* Header Skeleton */}
      <div className="border-b border-[#F2EFEA] pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 bg-[#EAE6DF]" />
          <Skeleton className="h-7 w-48 bg-[#E2DDD5]" />
        </div>
      </div>

      {/* Search & Filter Bar Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-[#F2EFEA] p-4 bg-[#FAF9F6]">
        <Skeleton className="h-10 w-full bg-[#EAE6DF]" />
        <Skeleton className="h-10 w-full bg-[#EAE6DF]" />
        <Skeleton className="h-10 w-full md:w-32 bg-[#E2DDD5]" />
      </div>

      {/* Orders List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-[#F2EFEA] bg-white rounded-lg p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FAF8F5] pb-3">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 bg-[#E2DDD5]" />
                <Skeleton className="h-3 w-24 bg-[#EAE6DF]" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full bg-[#FAF8F5]" />
            </div>

            <div className="flex items-center gap-4 py-2">
              <Skeleton className="w-16 h-16 rounded bg-[#FAF8F5] shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-44 bg-[#E2DDD5]" />
                <Skeleton className="h-3 w-28 bg-[#EAE6DF]" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-5 w-20 bg-[#E2DDD5]" />
                <Skeleton className="h-3 w-12 bg-[#EAE6DF] ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Stack>
  )
}
