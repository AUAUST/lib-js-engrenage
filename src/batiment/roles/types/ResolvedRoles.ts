import type { ResolvedEffects } from "#batiment/roles/types/ResolvedEffects";
import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";

export interface ResolvedRoles {
  readonly roles: Readonly<Record<string, ResolvedRoleContract>>;
  readonly aliases: Readonly<Record<string, string>>;
  readonly effects: ResolvedEffects;
}
