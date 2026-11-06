import { readEnvironmentRoles } from "#project/config/operations/readEnvironmentRoles";
import { noRoles } from "#project/structure/constants";
import {
  resolveRoles,
  type ResolvedRoles,
  type RoleEnvironment,
} from "#project/structure/index";
import type { Resolver } from "#foundation/options/index";
import type { Role } from "#project/roles/index";

export async function resolveEnvironmentRoles(
  config: Resolver,
  name: RoleEnvironment,
  option: { readonly enabled: boolean; readonly roles?: readonly Role[] },
): Promise<ResolvedRoles> {
  return option.enabled && option.roles !== undefined
    ? resolveRoles({
        ...(await readEnvironmentRoles(config, option.roles)),
        environment: name,
      })
    : noRoles;
}
