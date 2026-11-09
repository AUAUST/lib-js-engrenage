import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

export interface RoleDefinition extends Omit<
  ResolvedRoleContract,
  | "nesting"
  | "index"
  | "public"
  | "discovered"
  | "lazy"
  | "scoped"
  | "strict"
  | "typeOnly"
  | "unique"
  | "required"
> {
  readonly nesting: ResolvedRoleContract["nesting"] | undefined;
  readonly index: boolean | undefined;
  readonly public: boolean | undefined;
  readonly discovered: boolean | undefined;
  readonly lazy: boolean | undefined;
  readonly scoped: boolean | undefined;
  readonly strict: boolean | undefined;
  readonly typeOnly: boolean | undefined;
  readonly unique: boolean | undefined;
  readonly required: boolean | undefined;
}
