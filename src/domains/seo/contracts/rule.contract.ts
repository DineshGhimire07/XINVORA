import type { NormalizedSEOEntity, SEOEntityType } from "./entity.contract"

export type RuleCategory =
  | "METADATA"
  | "CONTENT"
  | "SCHEMA"
  | "IMAGES"
  | "LINKS"
  | "INDEXING"
  | "PERFORMANCE"
  | "ACCESSIBILITY"

export type RuleSeverity = "HIGH" | "MEDIUM" | "LOW"

export interface FixStrategy {
  id: string
  title: string
  description: string
  type: "AUTOMATED" | "TEMPLATE" | "MANUAL"
}

export interface AuditRuleResult {
  ruleId: string
  entityType: SEOEntityType
  entityId: string
  category: RuleCategory
  severity: RuleSeverity
  message: string
  impact: string
  detectedValue?: string
  fixStrategies: FixStrategy[]
}

export interface AuditRule {
  id: string
  name: string
  description: string
  category: RuleCategory
  severity: RuleSeverity
  priority: number // Higher priority executes first
  version: string
  dependencies?: string[]
  fixStrategies: FixStrategy[]
  evaluate(entity: NormalizedSEOEntity, snapshot?: any): AuditRuleResult | null
}
