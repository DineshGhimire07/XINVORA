import { findLookbookSlides } from "@/db/queries"
import { redirect } from "next/navigation"

export const revalidate = 0

export default async function LooksPage() {
  const { slides } = await findLookbookSlides()
  const activeSlides = slides.filter((s: any) => s.isActive && s.imageUrl)

  if (activeSlides.length > 0) {
    // Redirect to the Looks Detail page of the first look
    redirect(`/looks/${activeSlides[0].id}`)
  }

  // Fallback if no looks exist
  redirect("/")
}
