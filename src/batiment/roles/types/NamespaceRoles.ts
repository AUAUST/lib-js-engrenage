import type { ResolvedEffects } from "#batiment/effects/index";
import type { Role } from "#batiment/roles/types/Role";

export interface NamespaceRoles {
  readonly roles: readonly Role[];
  readonly effects: ResolvedEffects;
  readonly typeImports: boolean;
  readonly published: boolean;
}
