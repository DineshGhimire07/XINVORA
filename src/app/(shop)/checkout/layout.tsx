import { Metadata } from "next"
import { redirect } from "next/navigation"
import { SessionService } from "@/services/session.service"

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
    redirect("/login?callbackUrl=/checkout")
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {children}
    </div>
  )
}
