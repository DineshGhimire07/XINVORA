import { ProductGridSkeleton } from "@/components/skeletons/product-grid-skeleton"

export default function WishlistLoading() {
  return <ProductGridSkeleton count={4} showHeader={true} />
}
