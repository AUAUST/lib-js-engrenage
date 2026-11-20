import { isString } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import { roleSchema } from "#batiment/roles/config/schemas/roleSchema";
import { completeRole } from "#batiment/roles/utils/completeRole";
import { findFileResolver } from "#batiment/roles/utils/findFileResolver";
import type { Role } from "#batiment/roles/types/Role";
import type { RoleRegistry } from "#batiment/roles/types/RoleRegistry";

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

    if (owner === undefined && findFileResolver(declared.file) !== undefined) {
      throw new Error(
        `${path}[${position}] gives the role ${registered} a \`file\` callback, which only a nested file role takes`,
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
