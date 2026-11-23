import { entryRoleName, indexRoleName } from "#batiment/roles/constants";
import type { ResolvedRoles } from "#batiment/roles/index";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";

export function getNamespaceRootRole(
  { entryFile, indexFile }: NamespaceStructure,
  roles: ResolvedRoles["roles"],
): { readonly role: string; readonly file: string } | undefined {
  if (entryFile !== undefined) {
    return { role: entryRoleName, file: entryFile };
  }

  return roles[indexRoleName] === undefined
    ? undefined
    : { role: indexRoleName, file: indexFile };
}
