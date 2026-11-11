import type { ReexportMode, RoleInput } from "#project/roles/index";
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
  // @debt restated by hand because the generated `RoleInput["reexport"]` is a non-empty tuple the schema output does not satisfy
  readonly reexport: ReexportMode | readonly ReexportMode[] | undefined;
  readonly nesting: ResolvedRoleContract["nesting"] | undefined;
  readonly index: boolean | undefined;
  readonly public: boolean | undefined;
  readonly subpath: boolean | undefined;
  readonly collected: boolean | undefined;
  readonly discovered: boolean | undefined;
  readonly scoped: boolean | undefined;
  readonly strict: boolean | undefined;
  readonly typeOnly: boolean | undefined;
  readonly unique: boolean | undefined;
  readonly required: boolean | undefined;
}
