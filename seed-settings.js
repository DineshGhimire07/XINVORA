require("dotenv").config({ path: ".env.local" })
const postgres = require("postgres")

const sql = postgres(process.env.DATABASE_URL)

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
      mode: "online", 
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

async function seed() {
  try {
    for (const item of defaultSettings) {
      await sql`
        INSERT INTO "app_settings" ("key", "value", "version")
        VALUES (${item.key}, ${sql.json(item.value)}, 1)
        ON CONFLICT ("key") DO NOTHING
      `
      console.log(`Seeded: ${item.key}`)
    }
    console.log("Seeding complete.")
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

seed()
