import { isString } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";
import { uncapitalize } from "@auaust/toolkit/string";

import { roleSchema } from "#batiment/roles/config/schemas/roleSchema";
import {
  roleCompanionPlaceholders,
  roleFilePlaceholders,
} from "#batiment/roles/constants";
import { completeRole } from "#batiment/roles/utils/completeRole";
import { isLocatedRoleFile } from "#batiment/roles/utils/isLocatedRoleFile";
import { listRolePlaceholders } from "#batiment/roles/utils/listRolePlaceholders";
import type { Role } from "#batiment/roles/types/Role";
import type { RoleRegistry } from "#batiment/roles/types/RoleRegistry";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

function assertPlaceholders(
  globs: Glob | Globs | undefined,
  known: readonly string[],
  subject: string,
) {
  const unknown = globs === undefined
    ? []
    : listRolePlaceholders(globs).filter((name) => {
        return !known.includes(uncapitalize(name));
      });

  if (unknown.length > 0) {
    throw new Error(
      `${subject} names ${unknown
        .map((name) => {
          return `<${name}>`;
        })
        .join(", ")}, which only ${known
        .map((name) => {
          return `<${name}>`;
        })
        .join(", ")} and their PascalCase forms fill`,
    );
  }
}

// @debt an environment's positions count its default roles before its listed ones, so an error names `src.roles[9]` for the config's `src.roles[0]`
export function registerRoles({
  owner,
  path,
  roles,
  registry,
  published,
}: {
  owner: string | undefined;
  path: string;
  roles: readonly (string | Role)[];
  registry: RoleRegistry;
  published: boolean;
}): string[] {
  const positions = new Map<string, number>();

  return roles.map((role, position) => {
    const name = isString(role) ? role : role.name;
    const previous = positions.get(name);

    if (previous !== undefined) {
      throw new Error(
        `${path}[${previous}] and ${path}[${position}] are both named ${name}`,
      );
    }

    positions.set(name, position);

    if (isString(role)) {
      return role;
    }

    const declared = roleSchema.resolve(
      role,
      undefined,
      `${path}[${position}]`,
    );

    const registered = owner === undefined ? name : `${owner}/${name}`;

    assertPlaceholders(
      declared.file,
      roleFilePlaceholders,
      `${path}[${position}].file`,
    );

    assertPlaceholders(
      declared.companions,
      roleCompanionPlaceholders,
      `${path}[${position}].companions`,
    );

    if (owner === undefined && isLocatedRoleFile(declared.file)) {
      throw new Error(
        `${path}[${position}] gives the role ${registered} \`file\` placeholders, which only a nested file role takes`,
      );
    }

    const nested = declared.roles === undefined
      ? undefined
      : freeze(
          registerRoles({
            owner: registered,
            path: `${path}[${position}].roles`,
            roles: declared.roles,
            registry,
            published,
          }),
        );

    registry.contracts[registered] = completeRole(
      registered,
      {
        ...declared,
        roles: nested,
        optIn: owner === undefined ? declared.optIn : true,
      },
      {
        published,
      },
    );

    for (const alias of declared.aliases ?? []) {
      const taken = registry.aliases[alias];

      if (taken !== undefined) {
        throw new Error(
          `${path}[${position}] reads ${alias} as ${registered}, which already reads as ${taken}`,
        );
      }

      registry.aliases[alias] = registered;
    }

    return registered;
  });
}
