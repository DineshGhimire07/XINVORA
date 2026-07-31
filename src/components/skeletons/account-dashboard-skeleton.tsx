import { Skeleton } from "@/components/ui/skeleton"
import { Grid } from "@/components/shared/grid"
import { Stack } from "@/components/shared/stack"

export function AccountDashboardSkeleton() {
  return (
    <Stack gap={8} className="animate-in fade-in-50 duration-300">
      {/* Header Skeleton */}
      <div className="border-b border-[#F2EFEA] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 bg-[#EAE6DF]" />
          <Skeleton className="h-8 w-64 bg-[#E2DDD5]" />
          <Skeleton className="h-4 w-44 bg-[#EAE6DF]" />
        </div>
        <Skeleton className="h-10 w-28 rounded-sm bg-[#E2DDD5] shrink-0" />
      </div>

      {/* 3 Status Summary Cards */}
      <Grid cols={{ base: 3, md: 3 }} gap={4}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#F2EFEA] rounded-xl p-3 md:p-5 flex items-center md:items-start gap-3">
            <Skeleton className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FAF8F5] shrink-0" />
            <div className="flex-1 space-y-2 min-w-0">
              <Skeleton className="h-3 w-16 md:w-24 bg-[#EAE6DF]" />
              <Skeleton className="h-6 md:h-8 w-10 md:w-16 bg-[#E2DDD5]" />
              <Skeleton className="hidden md:block h-3 w-28 bg-[#F2EFEA]" />
            </div>
          </div>
        ))}
      </Grid>

      {/* Recent Orders Section Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 bg-[#E2DDD5]" />
          <Skeleton className="h-4 w-20 bg-[#EAE6DF]" />
        </div>

        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white border border-[#F2EFEA] rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#FAF8F5] pb-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-24 bg-[#E2DDD5]" />
                  <Skeleton className="h-3 w-20 bg-[#EAE6DF]" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full bg-[#FAF8F5]" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-md bg-[#FAF8F5] shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48 bg-[#E2DDD5]" />
                  <Skeleton className="h-3 w-32 bg-[#EAE6DF]" />
                </div>
                <Skeleton className="h-4 w-16 bg-[#E2DDD5]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Stack>
  )
}
