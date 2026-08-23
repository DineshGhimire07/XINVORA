import type {
  PhotographyVariables,
  CompiledPromptResult,
  CompilationLayer,
  PromptTemplateDefinition,
} from "../contracts/prompt.contract"
import { TemplateRegistryEngine } from "./template-registry.engine"
import { IdentityParserEngine } from "./identity-parser.engine"

export class PromptCompilerEngine {
  /**
   * Compiles a deterministic, fully resolved photography prompt for the given role and variables.
   */
  public static compile(
    variables: PhotographyVariables,
    customTemplate?: PromptTemplateDefinition
  ): CompiledPromptResult {
    const template = customTemplate || TemplateRegistryEngine.getTemplate(variables.imageRoleSlug)

    const resolvedVars: Record<string, string> = {}

    // 1. Basic Product Info
    resolvedVars["{{PRODUCT_NAME}}"] = variables.productName || "XINVORA Garment"
    resolvedVars["{{PRODUCT_CATEGORY}}"] = variables.productCategory || "Apparel"

    // 2. Product Identity
    if (variables.garmentIdentity) {
      resolvedVars["{{PRODUCT_IDENTITY}}"] = IdentityParserEngine.formatIdentityMarkdown(variables.garmentIdentity)
    } else {
      resolvedVars["{{PRODUCT_IDENTITY}}"] = "Garment identity not yet locked. Follow visual details from master references strictly."
    }

    // 3. Variant Identity (Strict colorway/print isolation)
    if (variables.variantIdentity && (variables.variantIdentity.colorName || variables.variantIdentity.specificMotif)) {
      const vLines: string[] = []
      if (variables.variantIdentity.colorName) {
        vLines.push(`- Specific Colorway: ${variables.variantIdentity.colorName}${variables.variantIdentity.hexCode ? ` (${variables.variantIdentity.hexCode})` : ""}`)
      }
      if (variables.variantIdentity.specificMotif) {
        vLines.push(`- Variant Motif/Print: ${variables.variantIdentity.specificMotif}`)
      }
      if (variables.variantIdentity.sku) {
        vLines.push(`- Variant SKU: ${variables.variantIdentity.sku}`)
      }
      vLines.push(`- CRITICAL: Use ONLY this variant's reference images. Do NOT borrow colors or motifs from other product colorways.`)
      resolvedVars["{{VARIANT_IDENTITY}}"] = vLines.join("\n")
    } else {
      resolvedVars["{{VARIANT_IDENTITY}}"] = "Standard master product colorway as shown in reference images."
    }

    // 4. Master References
    resolvedVars["{{MASTER_FRONT_REFERENCE}}"] = variables.references.masterFrontUrl
      ? `Original Front Reference Image: ${variables.references.masterFrontUrl}`
      : "Original Front Reference Image: [Supplied in vision context]"

    resolvedVars["{{MASTER_BACK_REFERENCE}}"] = variables.references.masterBackUrl
      ? `Original Back Reference Image: ${variables.references.masterBackUrl}`
      : "Original Back Reference Image: [Supplied in vision context]"

    // Target Colorway (for Color Transfer / Recolor Role)
    resolvedVars["{{TARGET_COLOR_NAME}}"] = variables.targetColorName || "Emerald Forest Green"
    resolvedVars["{{TARGET_HEX_CODE}}"] = variables.targetHexCode || "#046307"
    resolvedVars["{{TARGET_COLOR_DESCRIPTION}}"] = variables.targetColorDescription || "Rich saturated tonal dye with authentic fabric sheen matching reference texture."

    if (variables.references.detailUrls && variables.references.detailUrls.length > 0) {
      resolvedVars["{{DETAIL_REFERENCES}}"] = `Detail Reference Images:\n${variables.references.detailUrls.map((u) => `- ${u}`).join("\n")}`
    } else {
      resolvedVars["{{DETAIL_REFERENCES}}"] = ""
    }

    // 5. Photography Directions
    resolvedVars["{{IMAGE_ROLE}}"] = template.name
    resolvedVars["{{PHOTOGRAPHY_DIRECTION}}"] = variables.photographyDirection || template.defaultPhotographyDirection || "Clean commercial fashion photograph."
    resolvedVars["{{BACKGROUND_DIRECTION}}"] = variables.backgroundDirection || template.defaultBackgroundDirection || "Neutral studio background."
    resolvedVars["{{CAMERA_DIRECTION}}"] = variables.cameraDirection || template.defaultCameraDirection || "Eye-level 50mm perspective."
    resolvedVars["{{LIGHTING_DIRECTION}}"] = variables.lightingDirection || template.defaultLightingDirection || "Soft commercial studio lighting."
    resolvedVars["{{MODEL_DIRECTION}}"] = variables.modelDirection || template.defaultModelDirection || "Natural professional model."
    resolvedVars["{{POSE_DIRECTION}}"] = variables.poseDirection || template.defaultPoseDirection || "Relaxed standing posture."
    resolvedVars["{{ENVIRONMENT_DIRECTION}}"] = variables.environmentDirection || template.defaultEnvironmentDirection || "Understated architectural studio."

    if (variables.modelReference) {
      resolvedVars["{{MODEL_REFERENCE}}"] = `Model Appearance Reference: ${variables.modelReference}`
    } else {
      resolvedVars["{{MODEL_REFERENCE}}"] = ""
    }

    if (variables.environmentReference) {
      resolvedVars["{{ENVIRONMENT_REFERENCE}}"] = `Environment Architecture Reference: ${variables.environmentReference}`
    } else {
      resolvedVars["{{ENVIRONMENT_REFERENCE}}"] = ""
    }

    // Replace variables in templateText
    let compiled = template.templateText

    for (const [key, value] of Object.entries(resolvedVars)) {
      if (value) {
        compiled = compiled.split(key).join(value)
      } else {
        // Remove unused placeholder line cleanly
        compiled = compiled.split(key).join("")
      }
    }

    // Clean up any double blank lines or trailing empty sections
    compiled = compiled
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+$/gm, "")
      .trim()

    // Build compilation layers for Prompt Inspector
    const layers: CompilationLayer[] = [
      { step: 1, title: "1. Global XINVORA Standards", content: "Commercial e-commerce fashion photography rules applied." },
      { step: 2, title: "2. Master Product-Preservation", content: "Do not redesign, simplify, embellish, or alter silhouette, neckline, seams, or print." },
      { step: 3, title: "3. Reference Priority", content: "1. Master Front/Back = Authority #1 | 2. Detail = Authority #2 | 3. Model/Env = Secondary." },
      { step: 4, title: "4. Structured Product Identity", content: resolvedVars["{{PRODUCT_IDENTITY}}"] },
      { step: 5, title: "5. Variant Identity Isolation", content: resolvedVars["{{VARIANT_IDENTITY}}"] },
      { step: 6, title: "6. Master Image References", content: `${resolvedVars["{{MASTER_FRONT_REFERENCE}}"]}\n${resolvedVars["{{MASTER_BACK_REFERENCE}}"]}` },
      { step: 7, title: "7. Image Role & Photography Direction", content: resolvedVars["{{PHOTOGRAPHY_DIRECTION}}"] },
      { step: 8, title: "8. Background & Environment", content: `${resolvedVars["{{BACKGROUND_DIRECTION}}"]}\n${resolvedVars["{{ENVIRONMENT_DIRECTION}}"]}` },
      { step: 9, title: "9. Camera & Lighting", content: `Camera: ${resolvedVars["{{CAMERA_DIRECTION}}"]}\nLighting: ${resolvedVars["{{LIGHTING_DIRECTION}}"]}` },
      { step: 10, title: "10. Model & Pose", content: `Model: ${resolvedVars["{{MODEL_DIRECTION}}"]}\nPose: ${resolvedVars["{{POSE_DIRECTION}}"]}` },
    ]

    return {
      roleSlug: variables.imageRoleSlug,
      roleName: template.name,
      version: template.version,
      compiledText: compiled,
      layers,
      resolvedVariables: resolvedVars,
      isLocked: false,
    }
  }
}
