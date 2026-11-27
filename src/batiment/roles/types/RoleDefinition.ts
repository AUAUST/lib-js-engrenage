import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";
import type { RoleInput } from "#batiment/roles/types/RoleInput";

export interface RoleDefinition extends Omit<
  ResolvedRoleContract,
  | "effects"
  | "exports"
  | "reexport"
  | "nesting"
  | "index"
  | "public"
  | "subpath"
  | "collected"
  | "surface"
  | "discovered"
  | "optIn"
  | "strict"
  | "typeOnly"
  | "unique"
  | "required"
> {
  readonly effects: RoleInput["effects"];
  readonly exports: RoleInput["exports"];
  readonly reexport: RoleInput["reexport"];
  readonly nesting: ResolvedRoleContract["nesting"] | undefined;
  readonly index: ResolvedRoleContract["index"] | undefined;
  readonly public: boolean | undefined;
  readonly subpath: ResolvedRoleContract["subpath"] | undefined;
  readonly collected: boolean | undefined;
  readonly surface: ResolvedRoleContract["surface"] | undefined;
  readonly discovered: boolean | undefined;
  readonly optIn: boolean | undefined;
  readonly strict: boolean | undefined;
  readonly typeOnly: boolean | undefined;
  readonly unique: boolean | undefined;
  readonly required: boolean | undefined;
}
