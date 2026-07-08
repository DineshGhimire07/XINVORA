import "dotenv/config"
import { db } from "./index"
import { appSettings } from "./schema/settings"
import { eq } from "drizzle-orm"

const defaultSettings = [
  {
    key: "general",
    value: {
      storeName: "XINVORA",
      storeTagline: "Luxury Redefined",
      storeDescription: "Premium fashion and lifestyle brand.",
      timezone: "Asia/Kathmandu",
      defaultLanguage: "en",
      currency: "NPR"
    }
  },
  {
    key: "store_contact",
    value: {
      supportEmail: "support@xinvora.com",
      salesEmail: "sales@xinvora.com",
      returnsEmail: "returns@xinvora.com",
      phone: "+977 9800000000",
      whatsapp: "+977 9800000000",
      officeHours: "Sun-Fri, 10:00 AM - 6:00 PM NPT",
      socialLinks: {
        instagram: "https://instagram.com/xinvora",
        facebook: "https://facebook.com/xinvora",
        tiktok: "https://tiktok.com/@xinvora",
        linkedin: "",
        youtube: ""
      }
    }
  },
  {
    key: "store_taxes",
    value: {
      businessName: "XINVORA Pvt. Ltd.",
      businessRegistrationNo: "123456789",
      pan: "987654321",
      vat: "987654321",
      taxRate: 13,
      currencySymbol: "Rs.",
      currencyCode: "NPR"
    }
  },
  {
    key: "store_shipping",
    value: {
      defaultDeliveryCharge: 200,
      freeDeliveryThreshold: 5000,
      estimatedDeliveryTime: "2-4 Business Days",
      courierName: "Standard Delivery"
    }
  },
  {
    key: "store_invoice",
    value: {
      invoicePrefix: "INV-",
      orderPrefix: "XNV-",
      invoiceFooter: "Thank you for shopping with XINVORA.",
      invoiceNotes: "Please keep this invoice for warranty and returns.",
      invoiceSize: "A4"
    }
  },
  {
    key: "appearance_theme",
    value: {
      mode: "system",
      primaryColor: "#000000",
      secondaryColor: "#ffffff",
      accentColor: "#cccccc",
      borderRadius: "0.5rem"
    }
  },
  {
    key: "appearance_homepage",
    value: {
      heroEnabled: true,
      collectionsEnabled: true,
      newsletterEnabled: false,
      testimonialsEnabled: false,
      sectionOrder: ["hero", "categories", "collections", "testimonials", "newsletter"]
    }
  },
  {
    key: "features",
    value: {
      analytics: true,
      marketing: false,
      wishlist: true,
      reviews: true,
      guestCheckout: true,
      blog: false,
      coupons: true,
      liveChat: false
    }
  },
  {
    key: "maintenance",
    value: {
      mode: "online", // "online", "store_closed", "offline"
      message: "We're currently upgrading the store. Please check back later.",
      expectedReturnTime: "Soon",
      countdownEnabled: false
    }
  },
  {
    key: "seo",
    value: {
      metaTitle: "XINVORA | Luxury Fashion",
      metaDescription: "Discover the latest luxury fashion at XINVORA.",
      ogImage: "/og-image.jpg",
      twitterImage: "/twitter-image.jpg",
      googleVerification: "",
      facebookVerification: "",
      robots: "index, follow",
      canonical: "https://xinvora.com"
    }
  },
  {
    key: "announcement",
    value: {
      enabled: true,
      text: "Free shipping on orders over Rs. 5000",
      backgroundColor: "#000000",
      textColor: "#ffffff",
      buttonText: "Shop Now",
      link: "/collections",
      startDate: null,
      endDate: null
    }
  }
]

async function seedSettings() {
  console.log("Seeding App Settings...")
  
  for (const setting of defaultSettings) {
    const existing = await db.query.appSettings.findFirst({
      where: eq(appSettings.key, setting.key)
    })
    
    if (!existing) {
      await db.insert(appSettings).values({
        key: setting.key,
        value: setting.value,
        version: 1
      })
      console.log(`✅ Seeded setting: ${setting.key}`)
    } else {
      console.log(`ℹ️ Setting already exists: ${setting.key}`)
    }
  }
  
  console.log("Settings seeding completed!")
  process.exit(0)
}

seedSettings().catch((error) => {
  console.error("Error seeding settings:", error)
  process.exit(1)
})
