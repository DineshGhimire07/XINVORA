/**
 * Structured Garment Identity Domain Contract.
 * Represents the authoritative physical characteristics of an existing garment,
 * strictly distinguished from photography direction.
 */
export interface GarmentIdentity {
  basic: {
    category: string
    subtype: string
    gender: "WOMEN" | "MEN" | "UNISEX"
    silhouette: string
    length: string
  }
  color: {
    primaryColor: string
    secondaryColor?: string
    accentColors?: string[]
    colorDistribution: string
  }
  pattern: {
    hasPattern: boolean
    patternType?: string
    patternScale?: string
    patternPlacement?: string
    motifDescription?: string
  }
  construction: {
    neckline: string
    sleeves: string
    straps?: string
    shoulderConstruction?: string
    waistConstruction?: string
    seams?: string
    stitching?: string
    closures?: string
    hemline?: string
    decorativeDetails?: string
    ruching?: string
    pleats?: string
    gathers?: string
    cutOuts?: string
    panels?: string
  }
  fabric: {
    visibleAppearance: string
    surfaceFinish: string
    apparentStretch: string
    opacity: "OPAQUE" | "SEMI_SHEER" | "SHEER"
    visibleTexture: string
  }
  proportions: {
    observableProportions: string
    torsoRatio?: string
    lengthFit?: string
  }
  identityDefiningDetails: string[]
  undeterminedFeatures: string[]
}

export type IdentityStatus = "DRAFT" | "REVIEWED" | "LOCKED"

export interface MasterReferences {
  masterFrontImageId?: string | null
  masterFrontUrl?: string | null
  masterBackImageId?: string | null
  masterBackUrl?: string | null
  detailImageIds?: string[]
  detailUrls?: string[]
}
