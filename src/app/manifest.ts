import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "XINVORA",
    short_name: "XINVORA",
    description: "Crafted for the way you live — Premium fashion for women.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F8F5F0",
    theme_color: "#1A1A1A",
    categories: ["shopping", "lifestyle", "fashion"],
    lang: "en",
    icons: [
      {
        src: "/favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/assets/brand/social/og-default.jpg",
        sizes: "1200x630",
        type: "image/jpeg",
      },
    ],
    shortcuts: [
      {
        name: "New Arrivals",
        short_name: "New In",
        description: "Browse the latest new arrivals",
        url: "/collections/new-arrivals",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Collections",
        short_name: "Collections",
        description: "Browse all collections",
        url: "/collections",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  }
}
