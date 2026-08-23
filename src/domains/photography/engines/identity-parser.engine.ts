import type { GarmentIdentity } from "../contracts/identity.contract"

export class IdentityParserEngine {
  /**
   * Safely parses raw text/markdown output from Prompt 01 (Vision AI) into
   * a validated GarmentIdentity object. Handles markdown code fences (```json ... ```).
   */
  public static parse(rawInput: string): { success: boolean; data?: GarmentIdentity; error?: string } {
    if (!rawInput || !rawInput.trim()) {
      return { success: false, error: "Input is empty." }
    }

    try {
      let cleaned = rawInput.trim()
      // Extract JSON if enclosed in markdown code fences
      const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
      if (jsonMatch && jsonMatch[1]) {
        cleaned = jsonMatch[1].trim()
      } else {
        // Look for the first '{' and last '}'
        const firstBrace = cleaned.indexOf("{")
        const lastBrace = cleaned.lastIndexOf("}")
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleaned = cleaned.substring(firstBrace, lastBrace + 1)
        }
      }

      const parsed = JSON.parse(cleaned)
      const normalized = this.normalize(parsed)
      return { success: true, data: normalized }
    } catch (err: any) {
      return {
        success: false,
        error: `Failed to parse structured JSON: ${err.message || "Invalid syntax"}`,
      }
    }
  }

  /**
   * Normalizes parsed JSON into guaranteed shape with safe defaults and undetermined features.
   */
  public static normalize(input: any): GarmentIdentity {
    const undetermined: string[] = Array.isArray(input?.undeterminedFeatures)
      ? input.undeterminedFeatures.filter(Boolean)
      : []

    const identityDetails: string[] = Array.isArray(input?.identityDefiningDetails)
      ? input.identityDefiningDetails.filter(Boolean)
      : []

    return {
      basic: {
        category: String(input?.basic?.category || input?.category || "Garment").trim(),
        subtype: String(input?.basic?.subtype || input?.subtype || "Standard Commercial").trim(),
        gender: (["WOMEN", "MEN", "UNISEX"].includes(input?.basic?.gender?.toUpperCase())
          ? input.basic.gender.toUpperCase()
          : "WOMEN") as "WOMEN" | "MEN" | "UNISEX",
        silhouette: String(input?.basic?.silhouette || input?.silhouette || "Not determinable from provided references.").trim(),
        length: String(input?.basic?.length || input?.length || "Standard").trim(),
      },
      color: {
        primaryColor: String(input?.color?.primaryColor || input?.primaryColor || "Not determinable from provided references.").trim(),
        secondaryColor: input?.color?.secondaryColor || input?.secondaryColor || undefined,
        accentColors: Array.isArray(input?.color?.accentColors) ? input.color.accentColors : undefined,
        colorDistribution: String(input?.color?.colorDistribution || input?.colorDistribution || "Uniform").trim(),
      },
      pattern: {
        hasPattern: Boolean(input?.pattern?.hasPattern ?? input?.hasPattern ?? false),
        patternType: input?.pattern?.patternType || input?.patternType || undefined,
        patternScale: input?.pattern?.patternScale || input?.patternScale || undefined,
        patternPlacement: input?.pattern?.patternPlacement || input?.patternPlacement || undefined,
        motifDescription: input?.pattern?.motifDescription || input?.motifDescription || undefined,
      },
      construction: {
        neckline: String(input?.construction?.neckline || input?.neckline || "Not determinable from provided references.").trim(),
        sleeves: String(input?.construction?.sleeves || input?.sleeves || "Not determinable from provided references.").trim(),
        straps: input?.construction?.straps || input?.straps || undefined,
        shoulderConstruction: input?.construction?.shoulderConstruction || input?.shoulderConstruction || undefined,
        waistConstruction: input?.construction?.waistConstruction || input?.waistConstruction || undefined,
        seams: input?.construction?.seams || input?.seams || undefined,
        stitching: input?.construction?.stitching || input?.stitching || undefined,
        closures: input?.construction?.closures || input?.closures || undefined,
        hemline: input?.construction?.hemline || input?.hemline || undefined,
        decorativeDetails: input?.construction?.decorativeDetails || input?.decorativeDetails || undefined,
        ruching: input?.construction?.ruching || input?.ruching || undefined,
        pleats: input?.construction?.pleats || input?.pleats || undefined,
        gathers: input?.construction?.gathers || input?.gathers || undefined,
        cutOuts: input?.construction?.cutOuts || input?.cutOuts || undefined,
        panels: input?.construction?.panels || input?.panels || undefined,
      },
      fabric: {
        visibleAppearance: String(input?.fabric?.visibleAppearance || input?.visibleAppearance || "Standard commercial weave").trim(),
        surfaceFinish: String(input?.fabric?.surfaceFinish || input?.surfaceFinish || "Matte").trim(),
        apparentStretch: String(input?.fabric?.apparentStretch || input?.apparentStretch || "Non-stretch").trim(),
        opacity: (["OPAQUE", "SEMI_SHEER", "SHEER"].includes(input?.fabric?.opacity?.toUpperCase())
          ? input.fabric.opacity.toUpperCase()
          : "OPAQUE") as "OPAQUE" | "SEMI_SHEER" | "SHEER",
        visibleTexture: String(input?.fabric?.visibleTexture || input?.visibleTexture || "Smooth").trim(),
      },
      proportions: {
        observableProportions: String(input?.proportions?.observableProportions || input?.observableProportions || "Proportional").trim(),
        torsoRatio: input?.proportions?.torsoRatio || input?.torsoRatio || undefined,
        lengthFit: input?.proportions?.lengthFit || input?.lengthFit || undefined,
      },
      identityDefiningDetails: identityDetails,
      undeterminedFeatures: undetermined,
    }
  }

  /**
   * Formats structured GarmentIdentity into clean, professional markdown
   * suitable for insertion into {{PRODUCT_IDENTITY}} prompt variables.
   */
  public static formatIdentityMarkdown(identity: GarmentIdentity): string {
    const lines: string[] = []

    lines.push(`- **Category & Subtype**: ${identity.basic.category} (${identity.basic.subtype})`)
    lines.push(`- **Target & Silhouette**: ${identity.basic.gender} | ${identity.basic.silhouette} | Length: ${identity.basic.length}`)
    lines.push(`- **Color**: Primary: ${identity.color.primaryColor}${identity.color.secondaryColor ? ` | Secondary: ${identity.color.secondaryColor}` : ""} | Distribution: ${identity.color.colorDistribution}`)
    if (identity.pattern.hasPattern) {
      lines.push(`- **Pattern**: ${identity.pattern.patternType || "Patterned"} (Scale: ${identity.pattern.patternScale || "Standard"}, Placement: ${identity.pattern.patternPlacement || "All-over"})`)
      if (identity.pattern.motifDescription) {
        lines.push(`  - Motif: ${identity.pattern.motifDescription}`)
      }
    } else {
      lines.push(`- **Pattern**: Solid / No pattern`)
    }

    lines.push(`- **Construction**:`)
    lines.push(`  - Neckline: ${identity.construction.neckline}`)
    lines.push(`  - Sleeves: ${identity.construction.sleeves}`)
    if (identity.construction.straps) lines.push(`  - Straps: ${identity.construction.straps}`)
    if (identity.construction.waistConstruction) lines.push(`  - Waist: ${identity.construction.waistConstruction}`)
    if (identity.construction.closures) lines.push(`  - Closures: ${identity.construction.closures}`)
    if (identity.construction.seams) lines.push(`  - Seams & Stitching: ${identity.construction.seams}${identity.construction.stitching ? ` (${identity.construction.stitching})` : ""}`)
    if (identity.construction.hemline) lines.push(`  - Hemline: ${identity.construction.hemline}`)
    if (identity.construction.decorativeDetails) lines.push(`  - Decorative Details: ${identity.construction.decorativeDetails}`)
    if (identity.construction.ruching) lines.push(`  - Ruching: ${identity.construction.ruching}`)
    if (identity.construction.pleats) lines.push(`  - Pleats: ${identity.construction.pleats}`)
    if (identity.construction.gathers) lines.push(`  - Gathers: ${identity.construction.gathers}`)
    if (identity.construction.cutOuts) lines.push(`  - Cut-Outs: ${identity.construction.cutOuts}`)
    if (identity.construction.panels) lines.push(`  - Panels: ${identity.construction.panels}`)

    lines.push(`- **Fabric Appearance (Visual Observation Only)**:`)
    lines.push(`  - Surface: ${identity.fabric.visibleAppearance} | Finish: ${identity.fabric.surfaceFinish} | Opacity: ${identity.fabric.opacity}`)
    lines.push(`  - Texture & Drape: ${identity.fabric.visibleTexture} | Stretch Appearance: ${identity.fabric.apparentStretch}`)

    if (identity.proportions.observableProportions) {
      lines.push(`- **Proportions**: ${identity.proportions.observableProportions}`)
    }

    if (identity.identityDefiningDetails && identity.identityDefiningDetails.length > 0) {
      lines.push(`- **Critical Identity-Defining Elements (MUST PRESERVE)**:`)
      identity.identityDefiningDetails.forEach((d) => lines.push(`  * ${d}`))
    }

    if (identity.undeterminedFeatures && identity.undeterminedFeatures.length > 0) {
      lines.push(`- **Undetermined Features (Do NOT Hallucinate)**:`)
      identity.undeterminedFeatures.forEach((u) => lines.push(`  * ${u}`))
    }

    return lines.join("\n")
  }
}
