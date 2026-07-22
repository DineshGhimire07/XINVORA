import { SessionService } from "@/services/session.service"
import { JournalRepository } from "@/db/repositories/journal.repository"
import { db } from "@/db/client"
import { users } from "@/db/schema/users"
import { JournalListingClient } from "./JournalListingClient"

export const metadata = {
  title: "Journal Management | Admin | XINVORA",
}

export default async function AdminJournalPage() {
  // Enforce secure administrative authorization check
  await SessionService.requireAdmin()

  const [postsRes, categories, authors] = await Promise.all([
    JournalRepository.searchPosts({ limit: 200 }),
    JournalRepository.findAllCategories(),
    db.select({ id: users.id, firstName: users.firstName, lastName: users.lastName }).from(users),
  ])

  return (
    <JournalListingClient
      initialPosts={postsRes.items}
      categories={categories}
      authors={authors}
    />
  )
}
