import { isFunction } from "@auaust/toolkit/isFunction";
import { isString } from "@auaust/toolkit/isString";
import { freeze } from "@auaust/toolkit/object";

import { roleSchema, type Role } from "#project/roles/index";
import { completeRole } from "#project/structure/utils/completeRole";
import type { RoleRegistry } from "#project/structure/types/RoleRegistry";

export function registerRoles({
  owner,
  path,
  roles,
  registry,
}: {
  owner: string | undefined;
  path: string;
  roles: readonly (string | Role)[];
  registry: RoleRegistry;
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

    if (owner === undefined && isFunction(declared.file)) {
      throw new Error(
        `${path}[${position}] gives the role ${registered} a \`file\` callback, which only a nested file role takes`,
      );
    }

    const nested =
      declared.roles === undefined
        ? undefined
        : freeze(
            registerRoles({
              owner: registered,
              path: `${path}[${position}].roles`,
              roles: declared.roles,
              registry,
            }),
          );

    registry.contracts[registered] = completeRole({
      ...declared,
      roles: nested,
      scoped: owner === undefined ? declared.scoped : true,
    });

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
