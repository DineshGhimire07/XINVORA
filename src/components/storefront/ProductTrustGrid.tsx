/**
 * ProductTrustGrid.tsx — XINVORA PDP Trust Badges
 * 4-column single row on ALL breakpoints (mobile + desktop).
 * Inspired by COS / Toteme — quiet minimalism, hairline dividers, no shadows.
 */

const features = [
  {
    id: "shipping",
    heading: "Dispatches in 24 Hours",
    subtitle: "Weekdays before 4 PM",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="w-[18px] h-[18px] md:w-[21px] md:h-[21px]"
      >
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
        <rect x="9" y="11" width="14" height="10" rx="2" />
        <path d="M12 11v6" />
        <path d="M9 17h.01M23 17h.01" />
      </svg>
    ),
  },
  {
    id: "delivery",
    heading: "Free Delivery",
    subtitle: "On orders above NPR 1,999",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="w-[18px] h-[18px] md:w-[21px] md:h-[21px]"
      >
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 5v3h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "returns",
    heading: "Easy Returns",
    subtitle: "7-Day Return Policy",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="w-[18px] h-[18px] md:w-[21px] md:h-[21px]"
      >
        <polyline points="1 4 1 10 7 10" />
        <path d="M3.51 15a9 9 0 1 0 .49-3.93" />
      </svg>
    ),
  },
  {
    id: "secure",
    heading: "Secure Payments",
    subtitle: "SSL Encrypted Checkout",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="w-[18px] h-[18px] md:w-[21px] md:h-[21px]"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
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
