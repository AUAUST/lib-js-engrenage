import { rolesSection } from "#project/config/operations/rolesSection";
import { noRoles } from "#project/structure/constants";
import {
  normalizeRoles,
  resolveRoles,
  type DeclaredRolesOption,
  type ResolvedRoles,
  type RoleEnvironment,
} from "#project/structure/index";
import type { Resolver } from "#foundation/options/index";

export async function resolveEnvironmentRoles(
  config: Resolver,
  name: RoleEnvironment,
  option: { readonly enabled: boolean; readonly roles?: DeclaredRolesOption },
): Promise<ResolvedRoles> {
  return option.enabled && option.roles !== undefined
    ? resolveRoles({
        environment: name,
        roles: await config.resolve(rolesSection),
        environmentRoles: normalizeRoles(option.roles),
      })
    : noRoles;
}
