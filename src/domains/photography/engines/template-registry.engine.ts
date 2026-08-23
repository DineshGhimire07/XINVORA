import type { PromptRoleSlug, PromptTemplateDefinition } from "../contracts/prompt.contract"

export class TemplateRegistryEngine {
  /**
   * Static Canonical Registry of the 7 Phase-1 photography prompt templates.
   */
  public static getCanonicalTemplates(): Record<PromptRoleSlug, PromptTemplateDefinition> {
    return {
      garment_identification: {
        roleSlug: "garment_identification",
        name: "01 — Garment Identification",
        version: "v1.0.0",
        description: "Forensic visual analysis of Master Front & Back references to extract authoritative Garment Identity JSON.",
        templateText: `You are a forensic product-photography analyst.

Analyze the supplied ORIGINAL FRONT and ORIGINAL BACK images of an existing commercial fashion garment.

Your task is NOT to redesign the garment and NOT to make creative suggestions.

Your task is to create an objective, structured visual identity specification of the exact garment shown in the references.

Treat the supplied images as the only authoritative source.

Analyze the garment carefully across both front and back views.

Identify only characteristics that are visually supported by the references.

Do NOT infer or invent information that cannot be observed.

If a characteristic cannot be confidently determined, write:

"Not determinable from provided references."

Do not guess exact:

- fabric composition
- measurements
- manufacturing materials
- hidden construction
- unseen closures
- unseen labels
- unseen stitching
- unseen back details

Document:

1. Garment category
2. Garment subtype
3. Silhouette
4. Length
5. Primary color
6. Secondary colors
7. Accent colors
8. Color distribution
9. Pattern presence
10. Pattern type
11. Pattern scale
12. Pattern placement
13. Motif characteristics
14. Neckline
15. Sleeves
16. Straps
17. Shoulder construction
18. Waist construction
19. Seams
20. Stitching
21. Closures
22. Hemline
23. Decorative details
24. Ruching
25. Pleats
26. Gathers
27. Cut-outs
28. Panels
29. Visible fabric appearance
30. Surface finish
31. Apparent stretch
32. Opacity
33. Visible texture
34. Observable proportions
35. Identity-defining details
36. Undetermined features

Pay particular attention to details that could easily be changed by an image-generation model.

These details must be explicitly documented.

Return valid structured JSON matching the XINVORA GarmentIdentity schema.

Do not include creative recommendations.

Do not improve the design.

Do not reinterpret the garment.

Describe only what exists in the reference images.`,
      },

      product_front: {
        roleSlug: "product_front",
        name: "02 — Product Front",
        version: "v1.0.0",
        description: "Clean straight-on e-commerce front photograph on solid studio backdrop in 3:4 portrait aspect ratio.",
        defaultPhotographyDirection: "Clean, professional, straight-on front product photograph.",
        defaultBackgroundDirection: "Solid neutral studio background (#F7F5F2) with subtle grounding shadow.",
        defaultCameraDirection: "Eye-level straight-on shot, 50mm lens perspective, zero barrel distortion, centered framing, 3:4 portrait aspect ratio.",
        defaultLightingDirection: "Soft diffuse commercial studio strobe lighting, balanced fill, no harsh specular hotspots.",
        templateText: `Create a highly realistic professional e-commerce photograph of the exact garment contained in the supplied MASTER FRONT and MASTER BACK references.

This is commercial product photography of an existing garment.

This is NOT a fashion-design task.

The supplied references are the authoritative source of truth.

PRODUCT IDENTITY:

{{PRODUCT_IDENTITY}}

VARIANT IDENTITY:

{{VARIANT_IDENTITY}}

MASTER REFERENCES:

{{MASTER_FRONT_REFERENCE}}

{{MASTER_BACK_REFERENCE}}

REFERENCE PRIORITY:

1. MASTER FRONT and MASTER BACK define the exact physical garment.
2. Optional detail references may clarify visible construction or texture.
3. Any model or environment reference defines photography only and must never redefine the garment.

PRODUCT PRESERVATION:

Preserve the exact:

- color
- color distribution
- print
- pattern
- pattern placement
- neckline
- sleeves
- straps
- silhouette
- length
- proportions
- seams
- stitching
- closures
- construction
- decorative details
- visible fabric characteristics

Do not redesign the garment.

Do not improve the garment.

Do not simplify the garment.

Do not embellish the garment.

Do not remove any existing detail.

Do not add any new detail.

Do not change the color.

Do not change the print.

Do not change the fabric appearance.

Do not change the silhouette.

Do not change the neckline.

Do not change sleeve or strap construction.

Do not invent missing details.

PHOTOGRAPHY ROLE:

{{PHOTOGRAPHY_DIRECTION}}

BACKGROUND:

{{BACKGROUND_DIRECTION}}

CAMERA & FRAMING:

{{CAMERA_DIRECTION}}

ASPECT RATIO:

3:4 portrait aspect ratio (vertical orientation).

LIGHTING:

{{LIGHTING_DIRECTION}}

QUALITY:

Photorealistic commercial fashion e-commerce photography.

Aspect ratio: 3:4 portrait orientation.

Natural physical garment behavior.

Accurate proportions.

Clean composition.

No illustration.

No stylization that changes garment identity.

The final image must represent the same physical garment shown in the supplied references.`,
      },

      product_back: {
        roleSlug: "product_back",
        name: "03 — Product Back",
        version: "v1.0.0",
        description: "Straight-on rear e-commerce photograph governed by Master Back authority in 3:4 portrait aspect ratio.",
        defaultPhotographyDirection: "Clean, professional, straight-on rear product photograph.",
        defaultBackgroundDirection: "Solid neutral studio background (#F7F5F2) with subtle grounding shadow.",
        defaultCameraDirection: "Eye-level straight-on rear shot, 50mm lens perspective, zero barrel distortion, centered framing, 3:4 portrait aspect ratio.",
        defaultLightingDirection: "Soft diffuse commercial studio strobe lighting, balanced fill, highlighting authentic rear closure and seams.",
        templateText: `Create a highly realistic professional e-commerce photograph of the rear of the exact garment contained in the supplied MASTER FRONT and MASTER BACK references.

This is commercial product photography of an existing garment.

This is NOT a fashion-design task.

The supplied references are the authoritative source of truth.

PRODUCT IDENTITY:

{{PRODUCT_IDENTITY}}

VARIANT IDENTITY:

{{VARIANT_IDENTITY}}

MASTER REFERENCES:

{{MASTER_FRONT_REFERENCE}}

{{MASTER_BACK_REFERENCE}}

REFERENCE PRIORITY:

1. MASTER BACK defines the exact rear garment construction and closures.
2. MASTER FRONT defines overall proportions, fabric texture, and colorway.
3. Optional detail references may clarify visible construction or texture.
4. Any model or environment reference defines photography only and must never redefine the garment.

PRODUCT PRESERVATION:

Generate a clean, professional, straight-on rear product photograph of the exact garment.

The MASTER BACK reference has primary authority for the rear construction.

Accurately preserve:

- back neckline
- back straps
- back seams
- back closures
- back panels
- rear pattern placement
- rear silhouette
- hemline
- fabric appearance

Do not invent a back design from the front.

Do not assume unseen construction.

Do not redesign the garment.

PHOTOGRAPHY ROLE:

{{PHOTOGRAPHY_DIRECTION}}

BACKGROUND:

{{BACKGROUND_DIRECTION}}

CAMERA & FRAMING:

{{CAMERA_DIRECTION}}

ASPECT RATIO:

3:4 portrait aspect ratio (vertical orientation).

LIGHTING:

{{LIGHTING_DIRECTION}}

QUALITY:

Photorealistic commercial fashion e-commerce photography.

Aspect ratio: 3:4 portrait orientation.

The final image must represent the same physical garment shown in the original references.`,
      },

      model_front: {
        roleSlug: "model_front",
        name: "04 — Model Front",
        version: "v1.0.0",
        description: "Realistic fashion model facing camera wearing the exact commercial garment in 3:4 portrait aspect ratio.",
        defaultPhotographyDirection: "Fashion model front view wearing the exact garment with natural drape and fit.",
        defaultModelDirection: "Professional editorial fashion model with understated modern luxury styling, neutral expression, and natural makeup.",
        defaultPoseDirection: "Relaxed standing posture facing camera, weight balanced, hands at sides or natural gentle placement.",
        defaultEnvironmentDirection: "Minimalist high-end studio with clean architectural lines.",
        defaultCameraDirection: "Full-length portrait, eye-level, 85mm portrait lens, slight depth of field, 3:4 portrait aspect ratio framing.",
        defaultLightingDirection: "Warm diffused beauty dish key light with soft ambient fill.",
        templateText: `Create a highly realistic professional fashion photograph showing a realistic model wearing the exact garment from the supplied MASTER FRONT and MASTER BACK references.

The model is NOT the source of garment design.

The garment references are the source of truth.

PRODUCT IDENTITY:

{{PRODUCT_IDENTITY}}

VARIANT IDENTITY:

{{VARIANT_IDENTITY}}

MASTER REFERENCES:

{{MASTER_FRONT_REFERENCE}}

{{MASTER_BACK_REFERENCE}}

MODEL DIRECTION:

{{MODEL_DIRECTION}}

POSE:

{{POSE_DIRECTION}}

ENVIRONMENT:

{{ENVIRONMENT_DIRECTION}}

CAMERA & FRAMING:

{{CAMERA_DIRECTION}}

ASPECT RATIO:

3:4 portrait aspect ratio (vertical orientation).

LIGHTING:

{{LIGHTING_DIRECTION}}

PRODUCT PRESERVATION:

Preserve the exact garment identity from the master references.

Do not alter:

- color
- print
- pattern
- neckline
- sleeves
- straps
- silhouette
- length
- proportions
- seams
- stitching
- closures
- decorative details
- fabric appearance

Do not redesign the garment to fit the model.

The model's body must adapt naturally to the existing garment.

Do not change garment construction to accommodate the pose.

The garment should look physically worn by the model while remaining the same commercial product shown in the reference images.

The result must look like authentic professional fashion photography.

Aspect ratio: 3:4 portrait orientation.

Not an illustration.

Not a redesigned garment.

Not a different garment.`,
      },

      model_back: {
        roleSlug: "model_back",
        name: "05 — Model Back",
        version: "v1.0.0",
        description: "Model photographed from the rear showcasing authentic back closures and hemline in 3:4 portrait aspect ratio.",
        defaultPhotographyDirection: "Fashion model rear view showcasing back closure, straps, and authentic silhouette.",
        defaultModelDirection: "Professional fashion model with hair styled to keep back neckline and closures fully visible.",
        defaultPoseDirection: "Standing facing away from camera, head turned slightly profile, natural elegant posture.",
        defaultEnvironmentDirection: "Minimalist high-end studio with clean architectural lines.",
        defaultCameraDirection: "Full-length rear perspective, eye-level, 85mm portrait lens, crisp garment focus, 3:4 portrait aspect ratio framing.",
        defaultLightingDirection: "Soft directional rim lighting accentuating rear garment seams and fabric drape.",
        templateText: `Create a highly realistic professional fashion photograph showing a realistic model from the rear wearing the exact garment from the supplied MASTER FRONT and MASTER BACK references.

The model is NOT the source of garment design.

The garment references are the source of truth.

PRODUCT IDENTITY:

{{PRODUCT_IDENTITY}}

VARIANT IDENTITY:

{{VARIANT_IDENTITY}}

MASTER REFERENCES:

{{MASTER_FRONT_REFERENCE}}

{{MASTER_BACK_REFERENCE}}

MODEL DIRECTION:

{{MODEL_DIRECTION}}

POSE:

{{POSE_DIRECTION}}

ENVIRONMENT:

{{ENVIRONMENT_DIRECTION}}

CAMERA & FRAMING:

{{CAMERA_DIRECTION}}

ASPECT RATIO:

3:4 portrait aspect ratio (vertical orientation).

LIGHTING:

{{LIGHTING_DIRECTION}}

PRODUCT PRESERVATION:

Show the model from the rear.

The MASTER BACK reference has primary authority for:

- rear neckline
- straps
- closure
- seams
- panels
- pattern placement
- hemline
- back silhouette

Do not invent a new back design.

Do not borrow garment details from another reference.

The rear view must remain consistent with the exact garment shown in the master references.

Aspect ratio: 3:4 portrait orientation.`,
      },

      lifestyle: {
        roleSlug: "lifestyle",
        name: "06 — Lifestyle",
        version: "v1.0.0",
        description: "Model in a curated environment where surroundings change but garment is 100% frozen in 3:4 portrait aspect ratio.",
        defaultPhotographyDirection: "Editorial lifestyle campaign photograph in an elevated architectural setting.",
        defaultModelDirection: "Poised fashion model interacting naturally with the environment.",
        defaultPoseDirection: "Dynamic candid pose (e.g. walking through a sunlit corridor or seated in an understated lounge).",
        defaultEnvironmentDirection: "Warm minimalist Mediterranean terrace or quiet luxury architectural interior with natural organic textures.",
        defaultCameraDirection: "Medium wide shot, 35mm cinematic lens, natural perspective with atmospheric depth, 3:4 portrait aspect ratio framing.",
        defaultLightingDirection: "Golden hour natural sunlight filtering through architectural openings with soft ambient bounce.",
        templateText: `Create a highly realistic professional lifestyle fashion photograph featuring the exact garment from the supplied MASTER FRONT and MASTER BACK references.

PRODUCT IDENTITY:

{{PRODUCT_IDENTITY}}

VARIANT IDENTITY:

{{VARIANT_IDENTITY}}

MASTER REFERENCES:

{{MASTER_FRONT_REFERENCE}}

{{MASTER_BACK_REFERENCE}}

MODEL:

{{MODEL_DIRECTION}}

POSE:

{{POSE_DIRECTION}}

ENVIRONMENT:

{{ENVIRONMENT_DIRECTION}}

CAMERA & FRAMING:

{{CAMERA_DIRECTION}}

ASPECT RATIO:

3:4 portrait aspect ratio (vertical orientation).

LIGHTING:

{{LIGHTING_DIRECTION}}

The environment, model, pose, lighting, and composition may change.

The garment may NOT change.

Preserve exactly:

- color
- print
- pattern
- neckline
- sleeves
- straps
- silhouette
- length
- proportions
- seams
- stitching
- closures
- construction
- decorative details
- visible fabric characteristics

Do not redesign the garment.

Do not improve the garment.

Do not add fashion details.

Do not remove existing details.

Do not alter the garment to suit the environment.

Aspect ratio: 3:4 portrait orientation.

The result should look like a real professional fashion campaign photograph while clearly showing the same physical commercial product.`,
      },

      detail_closeup: {
        roleSlug: "detail_closeup",
        name: "07 — Detail Close-Up",
        version: "v1.0.0",
        description: "Macro texture and craftsmanship photograph highlighting visible seams, hardware, and weave in 3:4 portrait aspect ratio.",
        defaultPhotographyDirection: "Macro close-up highlighting authentic garment construction, fabric weave, and stitching.",
        defaultCameraDirection: "Macro 100mm lens, tight framing on key construction detail (e.g. neckline, boning, pleating, or closure), shallow depth of field, 3:4 portrait aspect ratio.",
        defaultLightingDirection: "Raking cross-lighting to reveal genuine fabric texture and stitch depth.",
        defaultBackgroundDirection: "Garment fabric fills frame, neutral softly blurred background.",
        templateText: `Create a highly realistic close-up photograph of the exact garment shown in the supplied MASTER FRONT and MASTER BACK references.

PRODUCT IDENTITY:

{{PRODUCT_IDENTITY}}

VARIANT IDENTITY:

{{VARIANT_IDENTITY}}

MASTER REFERENCES:

{{MASTER_FRONT_REFERENCE}}

{{MASTER_BACK_REFERENCE}}

Focus on actual visible identity-defining details such as:

- fabric surface
- print
- stitching
- seams
- ruching
- pleats
- hardware
- neckline construction
- straps
- decorative details

Do not invent microscopic fabric structures.

Do not create artificial texture.

Do not change the garment color.

Do not create a different material.

Do not invent construction details that cannot be observed.

The close-up must represent the actual visible characteristics of the supplied garment.

If a detail cannot be confidently determined from the references, do not invent it.

ASPECT RATIO:

3:4 portrait aspect ratio (vertical orientation).

The final image must remain consistent with the exact physical garment.`,
      },

      color_transfer: {
        roleSlug: "color_transfer",
        name: "08 — Color Reference Front",
        version: "v1.0.0",
        description: "Take dress design from Master References + color from Color Reference image to generate Product Front in new color.",
        defaultPhotographyDirection: "Clean, professional, straight-on front product photograph transferred into new reference color.",
        defaultBackgroundDirection: "Solid neutral studio background (#F7F5F2) with subtle grounding shadow.",
        defaultCameraDirection: "Eye-level straight-on shot, 50mm lens perspective, zero barrel distortion, centered framing, 3:4 portrait aspect ratio.",
        defaultLightingDirection: "Soft diffuse commercial studio strobe lighting, balanced fill, highlighting true fabric dye and texture.",
        templateText: `You are performing a commercial product photography recolor transfer.

REFERENCES PROVIDED:

1. MASTER DESIGN REFERENCE:
Defines the exact garment design, silhouette, cut, neckline, sleeves/straps, seams, boning, stitching, construction, and fabric drape.
Preserve 100% of this physical design. Do NOT redesign the garment.

2. COLOR REFERENCE IMAGE:
Defines the authoritative target color, dye shade, tone, and surface finish.

INSTRUCTION:

Generate a clean, professional, straight-on commercial e-commerce PRODUCT FRONT photograph of the exact garment from the MASTER DESIGN REFERENCE, transferred into the exact colorway shown in the COLOR REFERENCE IMAGE.

PRESERVATION RULES:

- Preserve the exact garment design, neckline, sleeves/straps, silhouette, length, proportions, seams, stitching, and fabric characteristics from the MASTER DESIGN REFERENCE.
- Apply the exact color tone, saturation, and dye shade from the COLOR REFERENCE IMAGE.
- Maintain realistic fabric highlights, shadow depths, and physical drape.
- Do not redesign or alter the garment structure.
- Do not invent new design elements.

PHOTOGRAPHY ROLE:

{{PHOTOGRAPHY_DIRECTION}}

BACKGROUND:

{{BACKGROUND_DIRECTION}}

CAMERA & FRAMING:

{{CAMERA_DIRECTION}}

ASPECT RATIO:

3:4 portrait aspect ratio (vertical orientation).

LIGHTING:

{{LIGHTING_DIRECTION}}

QUALITY:

Photorealistic commercial fashion e-commerce photography.

Aspect ratio: 3:4 portrait orientation.

Exact design fidelity to the Master Design Reference with exact color fidelity to the Color Reference Image.

The final image will serve as the authoritative Product Front for this new colorway.`,
      },
    }
  }

  public static getTemplate(roleSlug: PromptRoleSlug): PromptTemplateDefinition {
    const all = this.getCanonicalTemplates()
    return all[roleSlug] || all.product_front
  }
}
