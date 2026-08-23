import { describe, it, expect } from "vitest"
import { IdentityParserEngine } from "@/domains/photography/engines/identity-parser.engine"
import { TemplateRegistryEngine } from "@/domains/photography/engines/template-registry.engine"
import { PromptCompilerEngine } from "@/domains/photography/engines/prompt-compiler.engine"
import type { GarmentIdentity } from "@/domains/photography/contracts/identity.contract"
import type { PhotographyVariables } from "@/domains/photography/contracts/prompt.contract"

describe("XINVORA AI Photography Prompt Studio — Phase 1 Test Suite", () => {
  const mockIdentity: GarmentIdentity = {
    basic: {
      category: "Dress",
      subtype: "Tiered Corset Midi Dress",
      gender: "WOMEN",
      silhouette: "Fitted corset bodice with tiered A-line skirt",
      length: "Midi",
    },
    color: {
      primaryColor: "Dusty Rose Pink",
      secondaryColor: "Warm Ivory",
      accentColors: ["Gold hardware"],
      colorDistribution: "Solid pink body with tonal stitching",
    },
    pattern: {
      hasPattern: false,
    },
    construction: {
      neckline: "Sweetheart square neckline",
      sleeves: "Elasticated short puff sleeves",
      straps: "Not determinable from provided references.",
      waistConstruction: "Structured corset waist with 8 vertical boning channels",
      seams: "Tonal topstitching on boning seams",
      closures: "Concealed rear zip closure",
      hemline: "Tiered ruffled bottom hem",
    },
    fabric: {
      visibleAppearance: "Lightweight woven poplin with structured drape",
      surfaceFinish: "Matte",
      apparentStretch: "Non-stretch body with elasticated sleeve cuffs",
      opacity: "OPAQUE",
      visibleTexture: "Smooth fine-weave texture",
    },
    proportions: {
      observableProportions: "35% bodice, 65% tiered skirt ratio",
      torsoRatio: "High-waist fitted transition",
    },
    identityDefiningDetails: [
      "8 vertical boning channels across bodice",
      "Sweetheart square neckline transition",
      "Tiered gathered skirt hem",
    ],
    undeterminedFeatures: [
      "Exact fabric composition percentage",
      "Hidden interior lining construction",
    ],
  }

  const mockReferences = {
    masterFrontUrl: "https://xinvora.com/media/corset-front.webp",
    masterBackUrl: "https://xinvora.com/media/corset-back.webp",
    detailUrls: ["https://xinvora.com/media/corset-stitching.webp"],
  }

  describe("1. IdentityParserEngine", () => {
    it("should parse valid raw JSON into a normalized GarmentIdentity", () => {
      const rawJson = JSON.stringify(mockIdentity)
      const res = IdentityParserEngine.parse(rawJson)
      expect(res.success).toBe(true)
      expect(res.data?.basic.category).toBe("Dress")
      expect(res.data?.color.primaryColor).toBe("Dusty Rose Pink")
      expect(res.data?.undeterminedFeatures).toHaveLength(2)
    })

    it("should parse JSON enclosed in markdown code fences", () => {
      const markdown = `\`\`\`json\n${JSON.stringify(mockIdentity, null, 2)}\n\`\`\``
      const res = IdentityParserEngine.parse(markdown)
      expect(res.success).toBe(true)
      expect(res.data?.basic.subtype).toBe("Tiered Corset Midi Dress")
    })

    it("should format structured identity into clean markdown without null or undefined", () => {
      const formatted = IdentityParserEngine.formatIdentityMarkdown(mockIdentity)
      expect(formatted).toContain("- **Category & Subtype**: Dress (Tiered Corset Midi Dress)")
      expect(formatted).toContain("Dusty Rose Pink")
      expect(formatted).toContain("8 vertical boning channels")
      expect(formatted).not.toContain("undefined")
      expect(formatted).not.toContain("null")
      expect(formatted).not.toContain("[object Object]")
    })
  })

  describe("2. TemplateRegistryEngine", () => {
    it("should provide all canonical Phase 1 prompt templates including colorway transfer", () => {
      const templates = TemplateRegistryEngine.getCanonicalTemplates()
      const keys = Object.keys(templates)
      expect(keys).toEqual([
        "garment_identification",
        "product_front",
        "product_back",
        "model_front",
        "model_back",
        "lifestyle",
        "detail_closeup",
        "color_transfer",
      ])
    })

    it("Prompt 01 should contain strict fact vs inference rules and uncertainty instructions", () => {
      const template01 = TemplateRegistryEngine.getTemplate("garment_identification")
      expect(template01.templateText).toContain("Not determinable from provided references.")
      expect(template01.templateText).toContain("Do NOT infer or invent information")
      expect(template01.templateText).toContain("Do not guess exact:")
    })
  })

  describe("3. Deterministic Prompt Compilation & Preservation Rules", () => {
    const baseVars: PhotographyVariables = {
      productName: "Aria Tiered Corset Dress",
      productCategory: "Dresses",
      garmentIdentity: mockIdentity,
      references: mockReferences,
      imageRoleSlug: "product_front",
    }

    it("should compile identically given identical inputs (Determinism)", () => {
      const run1 = PromptCompilerEngine.compile(baseVars)
      const run2 = PromptCompilerEngine.compile(baseVars)
      expect(run1.compiledText).toBe(run2.compiledText)
      expect(run1.layers).toEqual(run2.layers)
    })

    it("should include Master Product-Preservation rules in Prompts 02–07", () => {
      const frontRoles: Array<PhotographyVariables["imageRoleSlug"]> = [
        "product_front",
        "product_back",
        "model_front",
        "lifestyle",
      ]

      for (const role of frontRoles) {
        const compiled = PromptCompilerEngine.compile({ ...baseVars, imageRoleSlug: role })
        expect(compiled.compiledText).toContain("Do not redesign the garment")
        expect(compiled.compiledText).not.toContain("undefined")
        expect(compiled.compiledText).not.toContain("null")
        expect(compiled.compiledText).not.toContain("[object Object]")
      }

      // Prompt 05 Model Back specific preservation
      const modelBackCompiled = PromptCompilerEngine.compile({ ...baseVars, imageRoleSlug: "model_back" })
      expect(modelBackCompiled.compiledText).toContain("Do not invent a new back design")
      expect(modelBackCompiled.compiledText).toContain("The rear view must remain consistent")

      // Prompt 07 Detail Close-Up specific preservation
      const detailCompiled = PromptCompilerEngine.compile({ ...baseVars, imageRoleSlug: "detail_closeup" })
      expect(detailCompiled.compiledText).toContain("Do not change the garment color")
      expect(detailCompiled.compiledText).toContain("Do not invent construction details")
      expect(detailCompiled.compiledText).not.toContain("undefined")
      expect(detailCompiled.compiledText).not.toContain("null")
    })

    it("should enforce 3:4 vertical portrait aspect ratio in all photo generation prompts (02–07)", () => {
      const photoRoles: Array<PhotographyVariables["imageRoleSlug"]> = [
        "product_front",
        "product_back",
        "model_front",
        "model_back",
        "lifestyle",
        "detail_closeup",
      ]

      for (const role of photoRoles) {
        const compiled = PromptCompilerEngine.compile({ ...baseVars, imageRoleSlug: role })
        expect(compiled.compiledText).toContain("3:4 portrait aspect ratio")
      }
    })

    it("should safely omit missing optional variables without artifacts", () => {
      const sparseVars: PhotographyVariables = {
        productName: "Basic Tee",
        productCategory: "Tops",
        references: {},
        imageRoleSlug: "product_front",
      }

      const compiled = PromptCompilerEngine.compile(sparseVars)
      expect(compiled.compiledText).not.toContain("undefined")
      expect(compiled.compiledText).not.toContain("null")
      expect(compiled.compiledText).not.toContain("[object Object]")
      expect(compiled.compiledText).toContain("Garment identity not yet locked")
    })
  })

  describe("4. Variant Isolation", () => {
    it("should strictly isolate variant A and variant B colorways and references", () => {
      const variantA: PhotographyVariables = {
        productName: "Aria Corset Dress",
        productCategory: "Dresses",
        garmentIdentity: mockIdentity,
        variantIdentity: {
          colorName: "Midnight Black",
          hexCode: "#000000",
          sku: "ARIA-BLK-01",
        },
        references: {
          masterFrontUrl: "https://xinvora.com/media/aria-black-front.webp",
          masterBackUrl: "https://xinvora.com/media/aria-black-back.webp",
        },
        imageRoleSlug: "product_front",
      }

      const variantB: PhotographyVariables = {
        productName: "Aria Corset Dress",
        productCategory: "Dresses",
        garmentIdentity: mockIdentity,
        variantIdentity: {
          colorName: "Burgundy Red",
          hexCode: "#800020",
          sku: "ARIA-RED-01",
        },
        references: {
          masterFrontUrl: "https://xinvora.com/media/aria-red-front.webp",
          masterBackUrl: "https://xinvora.com/media/aria-red-back.webp",
        },
        imageRoleSlug: "product_front",
      }

      const compiledA = PromptCompilerEngine.compile(variantA)
      const compiledB = PromptCompilerEngine.compile(variantB)

      expect(compiledA.compiledText).toContain("Midnight Black")
      expect(compiledA.compiledText).toContain("aria-black-front.webp")
      expect(compiledA.compiledText).not.toContain("Burgundy Red")
      expect(compiledA.compiledText).not.toContain("aria-red-front.webp")

      expect(compiledB.compiledText).toContain("Burgundy Red")
      expect(compiledB.compiledText).toContain("aria-red-front.webp")
      expect(compiledB.compiledText).not.toContain("Midnight Black")
    })
  })

  describe("5. Role-Specific Instructions & Separation of Concerns", () => {
    const vars: PhotographyVariables = {
      productName: "Silk Slip Dress",
      productCategory: "Dresses",
      garmentIdentity: mockIdentity,
      references: mockReferences,
      imageRoleSlug: "product_front",
    }

    it("Product Back should explicitly prioritize Master Back authority", () => {
      const compiled = PromptCompilerEngine.compile({ ...vars, imageRoleSlug: "product_back" })
      expect(compiled.compiledText).toContain("MASTER BACK defines the exact rear garment construction")
      expect(compiled.compiledText).toContain("Do not invent a back design from the front")
    })

    it("Model Front should instruct model adaptation to garment, not vice versa", () => {
      const compiled = PromptCompilerEngine.compile({ ...vars, imageRoleSlug: "model_front" })
      expect(compiled.compiledText).toContain("The model is NOT the source of garment design")
      expect(compiled.compiledText).toContain("The model's body must adapt naturally to the existing garment")
    })

    it("Lifestyle should allow creative environment while freezing garment identity", () => {
      const compiled = PromptCompilerEngine.compile({ ...vars, imageRoleSlug: "lifestyle" })
      expect(compiled.compiledText).toContain("The environment, model, pose, lighting, and composition may change")
      expect(compiled.compiledText).toContain("The garment may NOT change")
    })

    it("Detail Close-Up should forbid microscopic fabric hallucination", () => {
      const compiled = PromptCompilerEngine.compile({ ...vars, imageRoleSlug: "detail_closeup" })
      expect(compiled.compiledText).toContain("Do not invent microscopic fabric structures")
      expect(compiled.compiledText).toContain("Do not create artificial texture")
    })

    it("Changing photography direction must not mutate the underlying Product Identity object", () => {
      const initialIdentityCopy = JSON.parse(JSON.stringify(mockIdentity))
      PromptCompilerEngine.compile({
        ...vars,
        imageRoleSlug: "lifestyle",
        lightingDirection: "Moody neon cyberpunk lighting",
      })

      expect(mockIdentity).toEqual(initialIdentityCopy)
    })

    it("Color Reference Front role should take master design + color reference and generate product front in 3:4 aspect ratio", () => {
      const colorVars: PhotographyVariables = {
        ...vars,
        imageRoleSlug: "color_transfer",
      }

      const compiled = PromptCompilerEngine.compile(colorVars)
      expect(compiled.compiledText).toContain("MASTER DESIGN REFERENCE")
      expect(compiled.compiledText).toContain("COLOR REFERENCE IMAGE")
      expect(compiled.compiledText).toContain("PRODUCT FRONT photograph")
      expect(compiled.compiledText).toContain("3:4 portrait aspect ratio")
      expect(compiled.compiledText).toContain("Do NOT redesign the garment")
    })
  })
})
