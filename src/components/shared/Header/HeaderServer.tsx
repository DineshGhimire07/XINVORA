import { Header } from "./Header"
import { findHierarchicalCollections } from "@/db/queries/collections"

export async function HeaderServer() {
  // Collections are safe to fetch server-side — they're already cached
  // (unstable_cache with tags, see collections.ts) and don't depend on
  // per-user session/cookies, so this doesn't block static rendering.
  const collections = await findHierarchicalCollections()

  return <Header collections={collections} />
}
