import type { ResolvedEffects } from "#batiment/effects/index";
import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";

export interface ResolvedRoles {
  readonly roles: Readonly<Record<string, ResolvedRoleContract>>;
  readonly aliases: Readonly<Record<string, string>>;
  readonly effects: ResolvedEffects;
}
