import { Metadata } from "next"
import { SessionService } from "@/services/session.service"
import { AdminSidebar } from "@/components/admin/AdminSidebar"

export const metadata: Metadata = {
  title: "Admin Dashboard | XINVORA",
  robots: "noindex, nofollow", // Prevent indexing of admin pages
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await SessionService.requireAdmin()

  return (
    <div className="min-h-screen pt-[72px] md:pt-20 bg-surface-secondary flex flex-col md:flex-row font-sans">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        <div className="max-w-[1200px] mx-auto">
          <header className="mb-8 pb-4 border-b border-border/40 flex justify-between items-end">
            <div>
              <p className="text-body-sm text-text-secondary">Logged in as {session.firstName || session.email}</p>
            </div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-accent bg-accent/10 px-2 py-1 rounded-sm">
              Admin Mode
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  )
}
