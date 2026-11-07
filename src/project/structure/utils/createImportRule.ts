import type { ImportRelation } from "#project/structure/types/ImportRelation";
import type { ImportRule } from "#project/structure/types/ImportRule";
import type { ImportRuleSource } from "#project/structure/types/ImportRuleSource";
import type { ImportRuleTarget } from "#project/structure/types/ImportRuleTarget";

export function createImportRule(
  source: ImportRuleSource,
  targets: readonly ImportRuleTarget[],
  relation: ImportRelation,
  effect: ImportRule["effect"],
  reason: string,
  { typeOnly = false, enforceable = true } = {},
): ImportRule[] {
  return targets.length === 0
    ? []
    : [
        {
          source,
          targets,
          relation,
          effect,
          typeOnly,
          enforceable,
          reason,
        },
      ];
}
