import { notFound } from "next/navigation"
import { Container } from "@/components/shared/container"
import Link from "next/link"
import { buildMetadata } from "@/lib/metadata"

const COMING_SOON_SLUGS = [
  "careers",
  "press",
  "new",
  "bestsellers",
  "sale",
  "cookies",
  "accessibility",
]

interface ComingSoonPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return COMING_SOON_SLUGS.map((slug) => ({
    slug,
  }))
}

export async function generateMetadata({ params }: ComingSoonPageProps) {
  const { slug } = await params
  if (!COMING_SOON_SLUGS.includes(slug)) {
    return {}
  }
  
  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " ")
  return buildMetadata({
    title: `${title} | Coming Soon`,
    description: `The XINVORA ${slug} page is coming soon.`,
  })
}

export default async function ComingSoonPage({ params }: ComingSoonPageProps) {
  const { slug } = await params
  
  if (!COMING_SOON_SLUGS.includes(slug)) {
    notFound()
  }

  const title = slug.charAt(0).toUpperCase() + slug.slice(1).replace("-", " ")

  return (
    <Container className="flex-1 flex flex-col items-center justify-center min-h-[60vh] py-24 text-center">
      <div className="max-w-md space-y-6">
        <p className="text-[10px] font-bold tracking-[0.25em] text-accent uppercase">
          Coming Soon
        </p>
        <h1 className="text-3xl sm:text-4xl font-display font-light tracking-wide text-text-primary">
          {title}
        </h1>
        <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
          We are currently preparing this section of our store to bring you the best experience. Check back soon for updates.
        </p>
        <div className="pt-6">
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-text-primary text-white text-body-sm tracking-widest uppercase hover:bg-text-secondary transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </Container>
  )
}
