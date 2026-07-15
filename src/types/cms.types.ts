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
