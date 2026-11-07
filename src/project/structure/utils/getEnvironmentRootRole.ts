import { entryRoleName, indexRoleName } from "#project/roles/constants";
import type { EnvironmentStructure } from "#project/structure/types/EnvironmentStructure";
import type { ResolvedRoles } from "#project/structure/types/ResolvedRoles";

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
