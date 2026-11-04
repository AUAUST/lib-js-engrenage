import { freeze } from "@auaust/toolkit/object";

import { roleContractDefaults } from "#project/structure/constants";
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
    effects: definition.effects,
    nesting: definition.nesting ?? roleContractDefaults.nesting,
    index: definition.index ?? roleContractDefaults.index,
    public: definition.public ?? roleContractDefaults.public,
    discovered: definition.discovered ?? roleContractDefaults.discovered,
    scoped: definition.scoped ?? roleContractDefaults.scoped,
    typeOnly: definition.typeOnly ?? roleContractDefaults.typeOnly,
  });
}
