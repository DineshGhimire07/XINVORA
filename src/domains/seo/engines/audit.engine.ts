import type { NormalizedSEOEntity } from "../contracts/entity.contract"
import type { AuditRuleResult } from "../contracts/rule.contract"
import { ruleRegistry } from "../rules/registry"
import "../rules/rules" // Ensure rules are registered

export class SEOAuditEngine {
  public static evaluateEntity(entity: NormalizedSEOEntity, snapshot?: any): AuditRuleResult[] {
    const results: AuditRuleResult[] = []
    const rules = ruleRegistry.getRules()

    for (const rule of rules) {
      try {
        const issue = rule.evaluate(entity, snapshot)
        if (issue) {
          results.push(issue)
        }
      } catch (err) {
        console.error(`[SEOAuditEngine] Error evaluating rule '${rule.id}':`, err)
      }
    }

    return results
  }
}
