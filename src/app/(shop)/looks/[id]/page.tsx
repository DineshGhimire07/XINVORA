import { buildMetadata } from "@/lib/metadata"
import { Container } from "@/components/shared/container"
import { findLookbookSlides } from "@/db/queries"
import { ShopTheLookCarousel } from "@/components/storefront/ShopTheLookCarousel"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = buildMetadata({
  title: "Shop the Look Details",
  description: "Curated looks. Effortless style. Discover complete outfits, styled for every moment.",
})

// Always dynamic to ensure slides update immediately
export const revalidate = 0

export default async function LookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { slides, products } = await findLookbookSlides()

  return (
    <main className="flex-1 bg-[#f7f5f2] pt-20 pb-16">
      {/* Carousel & Tagged Products Grid below */}
      <ShopTheLookCarousel 
        slides={slides} 
        products={products} 
        initialSlideId={id} 
        isDetailPage={true} 
      />
    </main>
  )
}
