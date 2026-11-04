import { freeze } from "@auaust/toolkit/object";

import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { RoleDefinition } from "#project/structure/types/RoleDefinition";

export function completeRole(
  definition: Partial<RoleDefinition>,
): ResolvedRoleContract {
  return freeze({
    file: definition.file,
    accepts: definition.accepts,
    roles: definition.roles,
    categories: definition.categories,
    exports: definition.exports,
    purpose: definition.purpose,
    nesting: definition.nesting ?? 0,
    index: definition.index ?? false,
    public: definition.public ?? false,
    discovered: definition.discovered ?? false,
    scoped: definition.scoped ?? false,
  });
}
