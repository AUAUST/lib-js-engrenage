import { listRolePlaceholders } from "#batiment/roles/utils/listRolePlaceholders";
import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";

export function isLocatedRoleFile(file: ResolvedRoleContract["file"]): boolean {
  return file !== undefined && listRolePlaceholders(file).length > 0;
}
