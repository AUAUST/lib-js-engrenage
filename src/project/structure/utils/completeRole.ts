import { isString } from "@auaust/toolkit/isString";
import { freeze } from "@auaust/toolkit/object";

import { roleContractDefaults } from "#project/roles/constants";
import { listReexportModes } from "#project/structure/utils/listReexportModes";
import { listStaticFileGlobs } from "#project/structure/utils/listStaticFileGlobs";
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

  const visible = definition.public ?? roleContractDefaults.public;
  const subpath = definition.subpath ?? roleContractDefaults.subpath;
  const index = definition.index ?? roleContractDefaults.index;

  if (
    subpath !== false &&
    !index &&
    listStaticFileGlobs(definition.file).length === 0
  ) {
    throw new Error(
      `The role ${name} sets \`subpath\` without static \`file\` names or globs or \`index\`: only files at a domain's root or a role's barrel take a subpath`,
    );
  }

  if (subpath !== false && !visible) {
    throw new Error(
      `The role ${name} sets \`subpath\` but is not public: a package subpath is a public import`,
    );
  }

  const scoped = definition.scoped ?? roleContractDefaults.scoped;

  // @debt a contract cannot see where its directory sits, so a root role never placed at an environment root passes this check
  if (definition.reexport !== undefined && (!index || scoped)) {
    throw new Error(
      `The role ${name} sets \`reexport\` without being a global role with \`index\`: only such a role's barrel sits at an environment root, where the root entry re-exports it`,
    );
  }

  return freeze({
    file: definition.file,
    fileDescription: definition.fileDescription,
    companions: definition.companions,
    accepts: definition.accepts,
    roles: definition.roles,
    categories: definition.categories,
    exports: freeze(resolved),
    purpose: definition.purpose,
    effects: definition.effects,
    rules: definition.rules,
    nesting: definition.nesting ?? roleContractDefaults.nesting,
    index,
    public: visible,
    subpath,
    reexport: definition.reexport === undefined
      ? undefined
      : listReexportModes(definition.reexport),
    collected: definition.collected ?? roleContractDefaults.collected,
    discovered: definition.discovered ?? roleContractDefaults.discovered,
    scoped,
    strict: definition.strict ?? roleContractDefaults.strict,
    typeOnly,
    unique: definition.unique ?? roleContractDefaults.unique,
    required: definition.required ?? roleContractDefaults.required,
  });
}
