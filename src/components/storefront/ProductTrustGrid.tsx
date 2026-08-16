/**
 * ProductTrustGrid.tsx — XINVORA PDP Trust Badges
 * 4-column single row on ALL breakpoints (mobile + desktop).
 * Inspired by COS / Toteme — quiet minimalism, hairline dividers, no shadows.
 */

import { Clock, Truck, Undo2, ShieldCheck } from "lucide-react"

const features = [
  {
    id: "shipping",
    heading: "Dispatches in 24 Hours",
    subtitle: "Weekdays before 4 PM",
    icon: <Clock className="w-[18px] h-[18px] md:w-[21px] md:h-[21px] stroke-[1.6]" />,
  },
  {
    id: "delivery",
    heading: "Free Delivery",
    subtitle: "On orders above NPR 1,999",
    icon: <Truck className="w-[18px] h-[18px] md:w-[21px] md:h-[21px] stroke-[1.6]" />,
  },
  {
    id: "returns",
    heading: "Easy Returns",
    subtitle: "7-Day Return Policy",
    icon: <Undo2 className="w-[18px] h-[18px] md:w-[21px] md:h-[21px] stroke-[1.6]" />,
  },
  {
    id: "secure",
    heading: "Secure Payments",
    subtitle: "SSL Encrypted Checkout",
    icon: <ShieldCheck className="w-[18px] h-[18px] md:w-[21px] md:h-[21px] stroke-[1.6]" />,
  },
]

export function ProductTrustGrid() {
  return (
    <div
      className="w-full bg-white rounded-2xl mt-6"
      style={{ border: "1px solid #F2EFEA" }}
    >
      {/* Always 4 columns — mobile and desktop */}
      <div className="grid grid-cols-4">
        {features.map((feature, i) => (
          <div
            key={feature.id}
            className="
              group flex flex-col items-center justify-center gap-1.5 md:gap-2
              py-4 md:py-5 px-2 md:px-3 text-center
              transition-all duration-200 ease-[ease]
              md:hover:bg-[#FAFAF8] md:rounded-2xl
            "
            style={{
              borderLeft: i > 0 ? "1px solid #F2EFEA" : undefined,
            }}
          >
            {/* Icon — desktop hover: translateY(-2px) */}
            <div
              className="text-[#9A9087] transition-transform duration-200 ease-[ease] md:group-hover:-translate-y-0.5"
            >
              {feature.icon}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-0.5 md:gap-1 items-center">
              <span className="text-[8.5px] md:text-[10px] font-semibold tracking-[0.06em] md:tracking-[0.08em] text-[#3A3530] leading-tight">
                {feature.heading}
              </span>
              <span className="text-[7.5px] md:text-[10px] text-[#9A9087] leading-snug">
                {feature.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
