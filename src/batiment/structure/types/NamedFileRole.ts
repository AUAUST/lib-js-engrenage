import type { ResolvedRoleContract } from "#batiment/roles/index";
import type { Globs } from "#types/Globs";

export interface NamedFileRole {
  readonly name: string;
  readonly contract: ResolvedRoleContract;
  readonly globs: Globs;
}
