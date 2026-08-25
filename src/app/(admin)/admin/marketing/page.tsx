import { SessionService } from "@/services/session.service"
import Link from "next/link"
import { Megaphone, Tag, Percent, Globe, BarChart3, ArrowUpRight, Sparkles, MessageSquare } from "lucide-react"

export const metadata = {
  title: "Marketing Hub | XINVORA Admin",
}

export default async function MarketingHubPage() {
  await SessionService.requireAdmin()

  const marketingChannels = [
    {
      title: "Announcements & Banners",
      description: "Manage high-visibility marquee notices, promotional banners, and campaign alert bars.",
      href: "/admin/cms/announcements",
      icon: Megaphone,
      accent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    {
      title: "Coupons & Discounts",
      description: "Create promo codes, percentage discounts, minimum cart spend rules, and coupon limits.",
      href: "/admin/coupons",
      icon: Tag,
      accent: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    },
    {
      title: "Off Section & Flash Deals",
      description: "Configure clearance discounts, tier markdown tags, and special curated deal ribbons.",
      href: "/admin/off-section",
      icon: Percent,
      accent: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    {
      title: "SEO Center & Search Engines",
      description: "Tune store metadata, Open Graph social cards, schema markup, and sitemaps for Google ranking.",
      href: "/admin/seo",
      icon: Globe,
      accent: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    {
      title: "CDP & Customer Analytics",
      description: "Track customer conversion funnels, retention cohorts, AOV trends, and audience segments.",
      href: "/admin/cdp",
      icon: BarChart3,
      accent: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    },
    {
      title: "Customer Inquiries & Feedback",
      description: "Review incoming customer messages, fit inquiries, dress requests, and back-in-stock alerts.",
      href: "/admin/customer-feedback",
      icon: MessageSquare,
      accent: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-admin-2xl font-bold font-display text-admin-text-primary tracking-tight">
              Marketing & Growth Hub
            </h1>
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-admin-accent-purple-bg text-admin-accent-purple-icon border border-purple-500/20">
              <Sparkles className="w-3 h-3" /> Live
            </span>
          </div>
          <p className="text-admin-sm text-admin-text-secondary mt-1">
            Drive sales, manage promotional channels, engage audiences, and monitor campaigns.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {marketingChannels.map((channel) => {
          const Icon = channel.icon
          return (
            <Link
              key={channel.title}
              href={channel.href}
              className="group bg-admin-surface border border-admin-border hover:border-admin-border-strong rounded-admin-lg p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-admin-md border ${channel.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-admin-text-secondary group-hover:text-admin-text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <h3 className="text-admin-base font-bold text-admin-text-primary group-hover:text-white transition-colors">
                  {channel.title}
                </h3>
                <p className="text-admin-xs text-admin-text-secondary leading-relaxed mt-2">
                  {channel.description}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-admin-border flex items-center justify-between text-admin-xs font-semibold text-admin-text-secondary group-hover:text-admin-text-primary transition-colors">
                <span>Manage Channel</span>
                <span>&rarr;</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
