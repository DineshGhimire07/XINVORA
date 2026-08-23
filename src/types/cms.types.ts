export interface HeroSlide {
  id: string
  imageDesktopUrl: string | null
  imageMobileUrl: string | null
  redirectUrl?: string
  altText?: string
  isActive: boolean
}

export interface HeroBlockData {
  slides: HeroSlide[]
}

export interface ProductGridBlockItem {
  productId: string
  customImageUrl?: string | null
}

export interface ProductGridBlockData {
  items: ProductGridBlockItem[]
}

export interface CollectionGridBlockData {
  collectionIds: string[]
}
export interface BannerBlockData {
  imageUrl: string | null
  imageMobileUrl?: string | null
  eyebrow?: string
  title: string
  tagline?: string
  linkText?: string
  linkUrl: string
  isActive?: boolean

  // DESKTOP CONTROLS
  desktopSizeMode?: "50dvh" | "ratio" | "custom"
  desktopRatio?: "32:10" | "21:9" | "16:9" | "4:3" | "1:1" | "3:4"
  desktopCustomSize?: string
  desktopFit?: "cover" | "contain" | "fill"
  desktopFocalPoint?: "center" | "left" | "right" | "custom"
  desktopCustomFocalPoint?: string

  // MOBILE CONTROLS
  mobileSizeMode?: "ratio" | "custom"
  mobileRatio?: "4:5" | "3:4" | "1:1" | "9:16" | "16:9"
  mobileCustomSize?: string
  mobileFit?: "cover" | "contain" | "fill"
  mobileFocalPoint?: "center" | "left" | "right" | "custom"
  mobileCustomFocalPoint?: string

  // Legacy compatibility fields
  size?: "editorial" | "full" | "natural" | "half" | "cinematic" | "landscape" | "classic" | "square" | "portrait" | "custom"
  customDesktopHeight?: string
  mobileSize?: "auto" | "portrait" | "standard-portrait" | "square" | "story" | "half" | "full" | "natural" | "custom"
  customMobileHeight?: string
  fit?: "cover" | "contain" | "scale-down" | "fill"
  position?: "object-center" | "object-top" | "object-bottom" | "object-left" | "object-right"
}

export type BlockType =
  | "HERO"
  | "RICHTEXT"
  | "IMAGE"
  | "VIDEO"
  | "PRODUCT_GRID"
  | "COLLECTION_GRID"
  | "JOURNAL_GRID"
  | "FAQ"
  | "NEWSLETTER"
  | "DIVIDER"
  | "SPACER"
  | "BUTTON_GROUP"
  | "GALLERY"
  | "QUOTE"
  | "BANNER";
