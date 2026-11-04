import type { ImportRuleSource } from "#project/structure/types/ImportRuleSource";
import type { ImportRuleTarget } from "#project/structure/types/ImportRuleTarget";

export interface ImportRule {
  readonly source: ImportRuleSource;
  readonly targets: readonly ImportRuleTarget[];
  readonly effect: "allow" | "forbid";
  readonly typeOnly: boolean;
  readonly enforceable: boolean;
  readonly reason: string;
}
