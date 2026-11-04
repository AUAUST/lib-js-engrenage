import type { BudgetKind } from "#tools/agents/types/BudgetKind";

export interface GithubWrite {
  readonly action: "create" | "edit" | "comment";
  readonly kind: BudgetKind;
  readonly body: string;
}
