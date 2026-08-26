import { Metadata } from "next"
import { SessionService } from "@/services/session.service"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminTopbar } from "@/components/admin/AdminTopbar"

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
    <div className="flex h-screen w-screen overflow-hidden bg-admin-content font-sans">
      {/* Persistent Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <AdminTopbar user={session} />

        {/* Scrollable content body */}
        <main className="flex-1 overflow-y-auto p-admin-page">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
