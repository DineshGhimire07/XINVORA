import { SessionService } from "@/services/session.service"
import { SEOService } from "@/domains/seo/services/seo.service"
import { SEOWorkspaceClient } from "./SEOWorkspaceClient"

export const metadata = {
  title: "SEO Center | Admin | XINVORA",
  description: "Enterprise SEO Operating System for XINVORA storefront.",
}

export default async function AdminSEOPage() {
  await SessionService.requireAdmin()

  const [overview, entities] = await Promise.all([
    SEOService.getDashboardOverview(),
    SEOService.getContentEntities(),
  ])

  return (
    <SEOWorkspaceClient
      initialOverview={overview}
      initialEntities={entities}
    />
  )
}
