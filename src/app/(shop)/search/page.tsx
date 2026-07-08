/**
 * app/search/page.tsx — XINVORA Search Page
 *
 * Implements the search interface connected to the live catalog engine.
 */

import { Section } from "@/components/shared/section"
import { Container } from "@/components/shared/container"
import { Stack } from "@/components/shared/stack"
import { buildMetadata } from "@/lib/metadata"
import Link from "next/link"
import Image from "next/image"
import { SearchInput } from "@/features/search/components/SearchInput"
import { searchProducts } from "@/db/queries"

export const metadata = buildMetadata({
  title: "Search",
  description: "Search the XINVORA catalogue and editorial journal stories.",
})

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : ""
  
  // Only execute search if query exists
  const response = q ? await searchProducts(q) : { results: [], totalCount: 0, query: q, hasMore: false }
  const searchResults = response.results
  const hasSearched = q.trim().length > 0
  const isEmpty = hasSearched && searchResults.length === 0

  return (
    <main className="flex-1 bg-background pt-20 md:pt-28 pb-16">
      <Container>
        
        {/* Search Input Area */}
        <Section id="search-bar" padding="md" className="bg-background text-left">
          <Stack gap={6} className="max-w-[40rem] mx-auto">
            <span className="text-overline text-accent tracking-overline uppercase select-none">
              Explore
            </span>
            <h1 className="text-display-md font-display text-text-primary leading-tight tracking-tight">
              Search XINVORA.
            </h1>
            
            <SearchInput />
          </Stack>
        </Section>

        {/* Search Results / States Block */}
        <Section id="search-results" padding="md" className="bg-background text-left">
          <div className="max-w-[60rem] mx-auto border-t border-border/40 pt-10">
            
            {isEmpty ? (
              <Stack gap={8} className="max-w-[40rem] mx-auto">
                {/* Notice */}
                <Stack gap={2}>
                  <p className="text-body-md font-bold text-text-primary uppercase tracking-wide select-none">
                    No results found.
                  </p>
                  <p className="text-body-sm text-text-secondary leading-relaxed">
                    We couldn&apos;t find any objects matching &quot;{q}&quot;. Review your spelling or try exploring our primary collections.
                  </p>
                </Stack>

                {/* Suggestions */}
                <Stack gap={3}>
                  <h2 className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase select-none">
                    Suggested Coordinates
                  </h2>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm text-text-secondary">
                    <li>
                      <Link href="/products/linen-draped-coat" className="hover:text-text-primary transition-colors">
                        &bull; Linen Draped Coat
                      </Link>
                    </li>
                    <li>
                      <Link href="/products/stoneware-vessel" className="hover:text-text-primary transition-colors">
                        &bull; Stoneware Vessel
                      </Link>
                    </li>
                    <li>
                      <Link href="/products/oak-lounge-chair" className="hover:text-text-primary transition-colors">
                        &bull; Oak Lounge Chair
                      </Link>
                    </li>
                    <li>
                      <Link href="/collections" className="hover:text-text-primary transition-colors">
                        &bull; All Collections
                      </Link>
                    </li>
                  </ul>
                </Stack>
              </Stack>
            ) : hasSearched && searchResults.length > 0 ? (
              <Stack gap={8}>
                <div className="text-[11px] font-semibold tracking-widest text-text-secondary uppercase select-none pb-4 border-b border-border/40">
                  {searchResults.length} Result{searchResults.length === 1 ? "" : "s"} for &quot;{q}&quot;
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                  {searchResults.map((product) => (
                    <Link 
                      key={product.id} 
                      href={`/products/${product.slug}`}
                      className="group flex flex-col gap-4 text-left"
                    >
                      {/* Visual Card Image */}
                      <div className="relative w-full aspect-product bg-surface border border-border rounded-sm overflow-hidden select-none">
                        {product.productImages?.[0] && (
                           <Image 
                             src={product.productImages[0].url} 
                             alt={product.productImages[0].altText || product.name} 
                             fill
                             sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                             className="object-cover transition-transform duration-500 group-hover:scale-105"
                           />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/[0.02]" />
                      </div>

                      {/* Product metadata */}
                      <Stack gap={2} className="text-left">
                        <span className="text-[10px] font-semibold tracking-[0.2em] text-accent uppercase select-none line-clamp-1">
                          {product.category?.name || "Product"}
                        </span>
                        <h3 className="text-body-md font-medium text-text-primary group-hover:text-accent transition-colors duration-200">
                          {product.name}
                        </h3>
                        <div className="pt-2">
                          <span className="text-[11px] font-semibold tracking-widest uppercase border-b border-text-primary/30 pb-0.5 hover:border-text-primary text-text-primary transition-colors duration-200">
                            View Object &rarr;
                          </span>
                        </div>
                      </Stack>
                    </Link>
                  ))}
                </div>
              </Stack>
            ) : null}
            
          </div>
        </Section>

      </Container>
    </main>
  )
}
