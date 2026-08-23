import { SessionService } from "@/services/session.service"
import { PhotographyReadRepository } from "@/domains/photography/repositories/photography.read.repository"
import { AIPhotographyStudioClient } from "./AIPhotographyStudioClient"

export const metadata = {
  title: "AI Photography Studio | XINVORA Admin",
}

export default async function AIPhotographyStudioPage() {
  await SessionService.requireAdmin()

  const templates = await PhotographyReadRepository.getAllPromptTemplates()

  // Serialize all DB data to strip Date instances (prevents Next.js RPC digest error in production)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serialize = (data: any) => (data ? JSON.parse(JSON.stringify(data)) : null)

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      <AIPhotographyStudioClient
        templates={serialize(templates)}
      />
    </div>
  )
}
