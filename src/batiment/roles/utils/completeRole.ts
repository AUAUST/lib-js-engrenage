import { isString } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import { roleContractDefaults } from "#batiment/roles/constants";
import { listReexportModes } from "#batiment/roles/utils/listReexportModes";
import { listStaticFileGlobs } from "#batiment/roles/utils/listStaticFileGlobs";
import type { ResolvedRoleContract } from "#batiment/roles/types/ResolvedRoleContract";
import type { ResolvedRoleExports } from "#batiment/roles/types/ResolvedRoleExports";
import type { RoleDefinition } from "#batiment/roles/types/RoleDefinition";

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
  { published }: { published: boolean },
): ResolvedRoleContract {
  const typeOnly = definition.typeOnly ?? roleContractDefaults.typeOnly;

  const resolved = resolveExports(definition.exports, typeOnly);

  if (typeOnly && resolved.values !== "none") {
    throw new Error(
      `The type-only role ${name} exports values as "${resolved.values}": a type-only role takes \`exports.values\` "none" or leaves it unset`,
    );
  }

  const index = definition.index ?? roleContractDefaults.index;

  if (
    definition.surface === "modules" &&
    (definition.file !== undefined || index !== false)
  ) {
    throw new Error(
      `The role ${name} sets \`surface\` "modules" with \`file\` or \`index\`: only a directory role without its own barrel exposes its modules directly`,
    );
  }

  const visible = definition.public ?? roleContractDefaults.public;

  if (definition.surface !== undefined && !visible) {
    throw new Error(
      `The role ${name} sets \`surface\` but resolves \`public\` false: only a public role's modules are reached outside their domain, so only a public role takes a surface`,
    );
  }

  const surface = (
    definition.surface ??
    (visible && !published && definition.file === undefined && index === false
      ? "modules"
      : "barrel")
  );

  const subpath = definition.subpath ?? roleContractDefaults.subpath;

  if (subpath !== false && listStaticFileGlobs(definition.file).length === 0) {
    if (index === false) {
      throw new Error(
        `The role ${name} sets \`subpath\` without static \`file\` names or globs or \`index\`: only files at a domain's root or a role's barrel take a subpath`,
      );
    }

    if (index === "root" && subpath === true) {
      throw new Error(
        `The role ${name} sets \`subpath\` true with \`index\` "root": a domain's role directory has no barrel to expose; set \`subpath\` "root"`,
      );
    }
  }

  if (subpath !== false && !visible) {
    throw new Error(
      `The role ${name} sets \`subpath\` but is not public: a package subpath is a public import`,
    );
  }

  const optIn = definition.optIn ?? roleContractDefaults.optIn;

  // @debt a contract cannot see where its directory sits, so a root role never placed at an environment root passes this check
  if (definition.reexport !== undefined && (index === false || optIn)) {
    throw new Error(
      `The role ${name} sets \`reexport\` without being a global role with \`index\`: only such a role's barrel sits at an environment root, where the root entry re-exports it`,
    );
  }

  return freeze({
    file: definition.file,
    companions: definition.companions,
    accepts: definition.accepts,
    roles: definition.roles,
    categories: definition.categories,
    exports: freeze(resolved),
    purpose: definition.purpose,
    debt: definition.debt,
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
    surface,
    discovered: definition.discovered ?? roleContractDefaults.discovered,
    optIn,
    strict: definition.strict ?? roleContractDefaults.strict,
    typeOnly,
    unique: definition.unique ?? roleContractDefaults.unique,
    required: definition.required ?? roleContractDefaults.required,
  });
}
