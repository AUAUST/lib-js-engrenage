import { entries, freeze, record } from "@auaust/toolkit/object";

import { registerRoles } from "#project/structure/utils/registerRoles";
import type { Role } from "#project/roles/index";
import type { RoleRegistry } from "#project/structure/types/RoleRegistry";
import type { StructureOptions } from "#project/structure/types/StructureOptions";

export function normalizeNamespaces({
  environment,
  namespaces,
}: {
  environment: string;
  namespaces: StructureOptions<string | Role>["namespaces"];
}): {
  readonly namespaces: StructureOptions["namespaces"];
  readonly defined: RoleRegistry;
} {
  const defined: RoleRegistry = {
    contracts: {},
    aliases: {},
  };

  const normalized = record(
    entries(namespaces).map(([path, namespace]) => {
      const enable = registerRoles({
        owner: `${environment}:${path}`,
        path: `${environment}.namespaces.${path}.roles.enable`,
        roles: namespace.roles.enable,
        registry: defined,
      });

      return [
        path,
        freeze({
          ...namespace,
          roles: freeze({ enable: freeze(enable) }),
        }),
      ] as const;
    }),
  );

  return freeze({ namespaces: freeze(normalized), defined });
}
