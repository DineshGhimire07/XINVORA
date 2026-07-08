import { db } from "@/db/client"
import { announcements } from "@/db/schema/cms"
import { Stack } from "@/components/shared/stack"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default async function CMSAnnouncementsRoute() {
  const items = await db.select().from(announcements)

  return (
    <Stack gap={8}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-display-sm font-display text-text-primary uppercase tracking-wide">
            Announcements
          </h1>
          <p className="text-body-sm text-text-secondary mt-2">
            Manage global announcement bars and banners.
          </p>
        </div>
        <div>
          <button className="bg-text-primary text-surface px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-accent transition-colors">
            + New Announcement
          </button>
        </div>
      </div>

      <Card className="rounded-none border-border-primary/40 shadow-sm bg-surface">
        <CardHeader className="border-b border-border-primary/20 bg-surface-secondary/50 py-3">
          <CardTitle className="text-[10px] font-bold tracking-widest uppercase text-text-secondary">
            All Announcements ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-surface-secondary/30 text-[10px] uppercase tracking-wider text-text-secondary border-b border-border/40">
                <tr>
                  <th className="px-6 py-4 font-medium">Message</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-secondary">
                      No announcements found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-secondary/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-text-primary truncate max-w-[300px]">
                        {item.message}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 border ${
                          item.status === "PUBLISHED" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : item.status === "DRAFT"
                            ? "bg-surface-secondary text-text-secondary border-border"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {item.priority}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/admin/cms/announcements/${item.id}`}
                          className="text-[10px] uppercase tracking-wider underline hover:text-accent font-semibold text-text-secondary"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Stack>
  )
}
