import type { GarmentIdentity, MasterReferences, IdentityStatus } from "./identity.contract"

export type PromptRoleSlug =
  | "garment_identification"
  | "product_front"
  | "product_back"
  | "model_front"
  | "model_back"
  | "lifestyle"
  | "detail_closeup"
  | "color_transfer"

export interface PhotographyVariables {
  productName: string
  productCategory: string
  garmentIdentity?: GarmentIdentity | null
  variantIdentity?: {
    colorName?: string | null
    hexCode?: string | null
    sku?: string | null
    specificMotif?: string | null
  } | null
  targetColorName?: string
  targetHexCode?: string
  targetColorDescription?: string
  references: MasterReferences
  imageRoleSlug: PromptRoleSlug
  photographyDirection?: string
  backgroundDirection?: string
  cameraDirection?: string
  lightingDirection?: string
  modelDirection?: string
  poseDirection?: string
  environmentDirection?: string
  modelReference?: string
  environmentReference?: string
}

export interface CompilationLayer {
  step: number
  title: string
  content: string
}

export interface CompiledPromptResult {
  roleSlug: PromptRoleSlug
  roleName: string
  version: string
  compiledText: string
  layers: CompilationLayer[]
  resolvedVariables: Record<string, string>
  isLocked: boolean
}

export interface PromptTemplateDefinition {
  roleSlug: PromptRoleSlug
  name: string
  version: string
  description: string
  templateText: string
  defaultPhotographyDirection?: string
  defaultBackgroundDirection?: string
  defaultCameraDirection?: string
  defaultLightingDirection?: string
  defaultModelDirection?: string
  defaultPoseDirection?: string
  defaultEnvironmentDirection?: string
}
