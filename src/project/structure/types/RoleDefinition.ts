import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

export interface RoleDefinition extends Omit<
  ResolvedRoleContract,
  "nesting" | "index" | "public" | "discovered" | "scoped" | "typeOnly"
> {
  readonly nesting: ResolvedRoleContract["nesting"] | undefined;
  readonly index: boolean | undefined;
  readonly public: boolean | undefined;
  readonly discovered: boolean | undefined;
  readonly scoped: boolean | undefined;
  readonly typeOnly: boolean | undefined;
}
