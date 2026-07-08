import { Metadata } from "next"
import { redirect } from "next/navigation"
import { SessionService } from "@/services/session.service"
import { getCart } from "@/db/queries/cart"

export const metadata: Metadata = {
  title: "Checkout | XINVORA",
  robots: "noindex, nofollow", // Prevent indexing
}

export default async function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await SessionService.optionalAuth()
  
  if (!session) {
    redirect("/auth/login?callbackUrl=/checkout")
  }

  const cart = await getCart(session.id, null)
  
  if (!cart || cart.items.length === 0) {
    redirect("/cart")
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {children}
    </div>
  )
}
