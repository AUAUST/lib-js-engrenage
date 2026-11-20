import { entryRoleName, indexRoleName } from "#batiment/roles/constants";
import type { ResolvedRoles } from "#batiment/roles/index";
import type { EnvironmentStructure } from "#batiment/structure/index";

export function getEnvironmentRootRole(
  { entryFile, indexFile }: EnvironmentStructure,
  roles: ResolvedRoles["roles"],
): { readonly role: string; readonly file: string } | undefined {
  if (entryFile !== undefined) {
    return { role: entryRoleName, file: entryFile };
  }

  return roles[indexRoleName] === undefined
    ? undefined
    : { role: indexRoleName, file: indexFile };
}
