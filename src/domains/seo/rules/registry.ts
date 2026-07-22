import type { AuditRule, RuleCategory, RuleSeverity } from "../contracts/rule.contract"

export class RuleRegistry {
  private static instance: RuleRegistry
  private rules: Map<string, AuditRule> = new Map()

  private constructor() {}

  public static getInstance(): RuleRegistry {
    if (!RuleRegistry.instance) {
      RuleRegistry.instance = new RuleRegistry()
    }
    return RuleRegistry.instance
  }

  public registerRule(rule: AuditRule): void {
    this.rules.set(rule.id, rule)
  }

  public getRules(): AuditRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority)
  }

  public getRule(id: string): AuditRule | undefined {
    return this.rules.get(id)
  }

  public getRulesByCategory(category: RuleCategory): AuditRule[] {
    return this.getRules().filter((r) => r.category === category)
  }

  public getRulesBySeverity(severity: RuleSeverity): AuditRule[] {
    return this.getRules().filter((r) => r.severity === severity)
  }
}

export const ruleRegistry = RuleRegistry.getInstance()
