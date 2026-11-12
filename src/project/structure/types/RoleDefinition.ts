import type { RoleInput } from "#project/roles/index";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

export interface RoleDefinition extends Omit<
  ResolvedRoleContract,
  | "exports"
  | "reexport"
  | "nesting"
  | "index"
  | "public"
  | "subpath"
  | "collected"
  | "discovered"
  | "scoped"
  | "strict"
  | "typeOnly"
  | "unique"
  | "required"
> {
  readonly exports: RoleInput["exports"];
  readonly reexport: RoleInput["reexport"];
  readonly nesting: ResolvedRoleContract["nesting"] | undefined;
  readonly index: boolean | undefined;
  readonly public: boolean | undefined;
  readonly subpath: ResolvedRoleContract["subpath"] | undefined;
  readonly collected: boolean | undefined;
  readonly discovered: boolean | undefined;
  readonly scoped: boolean | undefined;
  readonly strict: boolean | undefined;
  readonly typeOnly: boolean | undefined;
  readonly unique: boolean | undefined;
  readonly required: boolean | undefined;
}
