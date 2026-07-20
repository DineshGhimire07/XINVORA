export interface GeneralSettings {
  storeName: string
  storeTagline?: string
  storeDescription?: string
  timezone: string
  defaultLanguage: string
  currency: string
}

export interface StoreContactSettings {
  supportEmail: string
  salesEmail: string
  returnsEmail: string
  phone: string
  whatsapp?: string
  officeHours?: string
  socialLinks: {
    instagram: string
    facebook: string
    tiktok: string
    linkedin: string
    youtube: string
  }
}

export interface StoreTaxesSettings {
  businessName: string
  businessRegistrationNo?: string
  pan?: string
  vat?: string
  taxRate: number
  currencySymbol: string
  currencyCode: string
}

export interface StoreShippingSettings {
  defaultDeliveryCharge: number
  freeDeliveryThreshold?: number
  estimatedDeliveryTime?: string
  courierName?: string
}

export interface StoreInvoiceSettings {
  invoicePrefix: string
  orderPrefix: string
  invoiceFooter?: string
  invoiceNotes?: string
  invoiceSize?: string
}

export interface AppearanceThemeSettings {
  mode: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  borderRadius: string
}

export interface AppearanceHomepageSettings {
  heroEnabled: boolean
  collectionsEnabled: boolean
  newsletterEnabled: boolean
  testimonialsEnabled: boolean
  sectionOrder: string[]
}

export interface FeaturesSettings {
  analytics: boolean
  marketing: boolean
  wishlist: boolean
  reviews: boolean
  guestCheckout: boolean
  blog: boolean
  coupons: boolean
  liveChat: boolean
}

export interface MaintenanceSettings {
  mode: "online" | "store_closed" | "offline"
  message: string
  expectedReturnTime?: string
  countdownEnabled: boolean
}

export interface SEOSettings {
  metaTitle: string
  metaDescription: string
  ogImage: string
  twitterImage: string
  googleVerification: string
  facebookVerification: string
  robots: string
  canonical: string
}

export interface AnnouncementSettings {
  enabled: boolean
  text: string
  backgroundColor: string
  textColor: string
  buttonText: string
  link: string
  startDate: string | null
  endDate: string | null
}

export interface PaymentQRSettings {
  esewaUrl: string
  khaltiUrl: string
  bankUrl: string
  bankDetails: string
}

export interface AboutPageSettings {
  heroImage: string
  curatedImage: string
  pricingImage: string
  futureImage: string
}

export interface AuthPageSettings {
  heroImageUrl: string
  headline: string
  subheading: string
}

export interface AppSettings {
  general: GeneralSettings
  store_contact: StoreContactSettings
  store_taxes: StoreTaxesSettings
  store_shipping: StoreShippingSettings
  store_invoice: StoreInvoiceSettings
  appearance_theme: AppearanceThemeSettings
  appearance_homepage: AppearanceHomepageSettings
  features: FeaturesSettings
  maintenance: MaintenanceSettings
  seo: SEOSettings
  announcement: AnnouncementSettings
  payment_qrs: PaymentQRSettings
  about_page: AboutPageSettings
  auth_page: AuthPageSettings
}

