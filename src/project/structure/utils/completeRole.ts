import { isString } from "@auaust/toolkit/isString";
import { freeze } from "@auaust/toolkit/object";

import { roleContractDefaults } from "#project/roles/constants";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { ResolvedRoleExports } from "#project/structure/types/ResolvedRoleExports";
import type { RoleDefinition } from "#project/structure/types/RoleDefinition";

function resolveExports(
  declared: RoleDefinition["exports"],
  typeOnly: boolean,
): ResolvedRoleExports {
  if (declared === "default") {
    return { values: "default", types: "none" };
  }

  if (isString(declared)) {
    return { values: typeOnly ? "none" : declared, types: declared };
  }

  return {
    values: declared?.values ?? (typeOnly ? "none" : undefined),
    types: declared?.types,
  };
}

export function completeRole(
  name: string,
  definition: Partial<RoleDefinition>,
): ResolvedRoleContract {
  const typeOnly = definition.typeOnly ?? roleContractDefaults.typeOnly;
  const resolved = resolveExports(definition.exports, typeOnly);

  if (typeOnly && resolved.values !== "none") {
    throw new Error(
      `The type-only role ${name} exports values as "${resolved.values}": a type-only role takes \`exports.values\` "none" or leaves it unset`,
    );
  }

  return freeze({
    file: definition.file,
    fileDescription: definition.fileDescription,
    accepts: definition.accepts,
    roles: definition.roles,
    categories: definition.categories,
    exports: freeze(resolved),
    purpose: definition.purpose,
    effects: definition.effects,
    rules: definition.rules,
    nesting: definition.nesting ?? roleContractDefaults.nesting,
    index: definition.index ?? roleContractDefaults.index,
    public: definition.public ?? roleContractDefaults.public,
    collected: definition.collected ?? roleContractDefaults.collected,
    discovered: definition.discovered ?? roleContractDefaults.discovered,
    scoped: definition.scoped ?? roleContractDefaults.scoped,
    strict: definition.strict ?? roleContractDefaults.strict,
    typeOnly,
    unique: definition.unique ?? roleContractDefaults.unique,
    required: definition.required ?? roleContractDefaults.required,
  });
}
