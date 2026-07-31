import { ProductGridSkeleton } from "@/components/skeletons/product-grid-skeleton"

export default function CollectionsLoading() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
      <ProductGridSkeleton count={8} showHeader={true} />
    </div>
  )
}
