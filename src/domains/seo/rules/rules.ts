import type { AuditRule, AuditRuleResult, FixStrategy } from "../contracts/rule.contract"
import type { NormalizedSEOEntity } from "../contracts/entity.contract"
import { ruleRegistry } from "./registry"

// 1. Missing Title Rule
export const missingTitleRule: AuditRule = {
  id: "missing_title",
  name: "Missing or Short SEO Title",
  description: "Ensures the entity has an optimized SEO title tag between 10 and 70 characters.",
  category: "METADATA",
  severity: "HIGH",
  priority: 100,
  version: "1.0",
  fixStrategies: [
    {
      id: "generate_title_template",
      title: "Generate from Title Template",
      description: "Auto-generate using standard template: {{name}} | XINVORA",
      type: "TEMPLATE",
    },
    {
      id: "manual_title_input",
      title: "Provide Title Manually",
      description: "Specify a custom meta title in the editor.",
      type: "MANUAL",
    },
  ],
  evaluate(entity: NormalizedSEOEntity): AuditRuleResult | null {
    const title = entity.seoTitle || entity.name
    if (!title || title.trim().length === 0) {
      return {
        ruleId: this.id,
        entityType: entity.entityType,
        entityId: entity.id,
        category: this.category,
        severity: this.severity,
        message: `${entity.entityType} '${entity.name}' is missing an SEO title tag.`,
        impact: "Search engines will use raw fallback text or truncate titles, reducing CTR by up to 35%.",
        detectedValue: "Missing",
        fixStrategies: this.fixStrategies,
      }
    }
    if (title.trim().length < 10) {
      return {
        ruleId: this.id,
        entityType: entity.entityType,
        entityId: entity.id,
        category: this.category,
        severity: "MEDIUM",
        message: `${entity.entityType} '${entity.name}' has a very short title (${title.length} chars).`,
        impact: "Short titles miss focus keywords and lower search ranking relevance.",
        detectedValue: title,
        fixStrategies: this.fixStrategies,
      }
    }
    return null;
  },
}

// 2. Missing Meta Description Rule
export const missingMetaDescriptionRule: AuditRule = {
  id: "missing_meta_description",
  name: "Missing or Short Meta Description",
  description: "Ensures the meta description is present and between 50 and 160 characters.",
  category: "METADATA",
  severity: "HIGH",
  priority: 90,
  version: "1.0",
  fixStrategies: [
    {
      id: "generate_meta_template",
      title: "Generate Meta Description",
      description: "Auto-generate description using entity summary or short text.",
      type: "TEMPLATE",
    },
    {
      id: "manual_meta_input",
      title: "Write Custom Meta Description",
      description: "Enter meta description manually.",
      type: "MANUAL",
    },
  ],
  evaluate(entity: NormalizedSEOEntity): AuditRuleResult | null {
    const desc = entity.seoDescription
    if (!desc || desc.trim().length === 0) {
      return {
        ruleId: this.id,
        entityType: entity.entityType,
        entityId: entity.id,
        category: this.category,
        severity: this.severity,
        message: `${entity.entityType} '${entity.name}' lacks a meta description.`,
        impact: "Search engines display arbitrary body snippets in SERP results.",
        detectedValue: "Missing",
        fixStrategies: this.fixStrategies,
      }
    }
    if (desc.trim().length < 50) {
      return {
        ruleId: this.id,
        entityType: entity.entityType,
        entityId: entity.id,
        category: this.category,
        severity: "MEDIUM",
        message: `${entity.entityType} '${entity.name}' meta description is too short (${desc.length} chars).`,
        impact: "Sub-optimal text density reduces organic click-through rates.",
        detectedValue: desc,
        fixStrategies: this.fixStrategies,
      }
    }
    return null
  },
}

// 3. Missing Canonical Rule
export const missingCanonicalRule: AuditRule = {
  id: "missing_canonical",
  name: "Missing Canonical URL",
  description: "Verifies the entity sets an explicit canonical URL tag.",
  category: "INDEXING",
  severity: "HIGH",
  priority: 80,
  version: "1.0",
  fixStrategies: [
    {
      id: "generate_canonical_default",
      title: "Set Default Canonical",
      description: "Set canonical tag to the canonical absolute path of the resource.",
      type: "AUTOMATED",
    },
  ],
  evaluate(entity: NormalizedSEOEntity): AuditRuleResult | null {
    if (!entity.canonicalUrl) {
      return {
        ruleId: this.id,
        entityType: entity.entityType,
        entityId: entity.id,
        category: this.category,
        severity: this.severity,
        message: `${entity.entityType} '${entity.name}' has no canonical URL configured.`,
        impact: "Search engines may index duplicate URL variations or parameter paths.",
        detectedValue: "Missing",
        fixStrategies: this.fixStrategies,
      }
    }
    return null
  },
}

// 4. Missing OpenGraph Image Rule
export const missingOpenGraphRule: AuditRule = {
  id: "missing_og_image",
  name: "Missing OpenGraph / Social Share Image",
  description: "Ensures the entity has a valid OpenGraph image for social media shares.",
  category: "METADATA",
  severity: "MEDIUM",
  priority: 70,
  version: "1.0",
  fixStrategies: [
    {
      id: "generate_og_from_first_image",
      title: "Use Primary Entity Image",
      description: "Set OG Image to the main image asset of this resource.",
      type: "AUTOMATED",
    },
  ],
  evaluate(entity: NormalizedSEOEntity): AuditRuleResult | null {
    if (!entity.ogImage) {
      return {
        ruleId: this.id,
        entityType: entity.entityType,
        entityId: entity.id,
        category: "METADATA",
        severity: this.severity,
        message: `${entity.entityType} '${entity.name}' is missing an OpenGraph social image.`,
        impact: "Social shares on Facebook, LinkedIn, WhatsApp, and X will render without a preview banner.",
        detectedValue: "Missing",
        fixStrategies: this.fixStrategies,
      }
    }
    return null
  },
}

// 5. Missing Image ALT Text Rule
export const missingImageALTRule: AuditRule = {
  id: "missing_image_alt",
  name: "Missing Image ALT Text",
  description: "Checks whether entity images have descriptive ALT text.",
  category: "IMAGES",
  severity: "MEDIUM",
  priority: 60,
  version: "1.0",
  fixStrategies: [
    {
      id: "generate_alt_from_name",
      title: "Generate ALT from Name",
      description: "Auto-fill missing image ALT attributes using entity title.",
      type: "TEMPLATE",
    },
  ],
  evaluate(entity: NormalizedSEOEntity): AuditRuleResult | null {
    if (!entity.images || entity.images.length === 0) return null

    const missingAltCount = entity.images.filter((img) => !img.alt || img.alt.trim().length === 0).length
    if (missingAltCount > 0) {
      return {
        ruleId: this.id,
        entityType: entity.entityType,
        entityId: entity.id,
        category: this.category,
        severity: this.severity,
        message: `${missingAltCount} image(s) in ${entity.entityType} '${entity.name}' are missing ALT text.`,
        impact: "Hurts Image Search SEO ranking and violates web accessibility standards.",
        detectedValue: `${missingAltCount} missing ALT`,
        fixStrategies: this.fixStrategies,
      }
    }
    return null
  },
}

// Register all rules into central RuleRegistry
ruleRegistry.registerRule(missingTitleRule)
ruleRegistry.registerRule(missingMetaDescriptionRule)
ruleRegistry.registerRule(missingCanonicalRule)
ruleRegistry.registerRule(missingOpenGraphRule)
ruleRegistry.registerRule(missingImageALTRule)
