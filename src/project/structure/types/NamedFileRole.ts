import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";

export interface NamedFileRole {
  readonly name: string;
  readonly contract: ResolvedRoleContract;
}
