import { entries, freeze, record } from "@auaust/toolkit/object";

import { flattenRoleReferences } from "#project/structure/utils/flattenRoleReferences";
import type { ResolvedRoleContract } from "#project/structure/types/ResolvedRoleContract";
import type { RoleReference } from "#project/structure/types/RoleReference";
import type { StructureEnvironmentName } from "#project/structure/types/StructureEnvironmentName";
import type { StructureOptions } from "#project/structure/types/StructureOptions";

export function normalizeNamespaces({
  environment,
  namespaces,
}: {
  environment: StructureEnvironmentName;
  namespaces: StructureOptions<RoleReference>["namespaces"];
}): {
  readonly namespaces: StructureOptions["namespaces"];
  readonly define: Readonly<Record<string, ResolvedRoleContract>>;
} {
  const define: Record<string, ResolvedRoleContract> = {};

  const normalized = record(
    entries(namespaces).map(([path, namespace]) => {
      return [
        path,
        freeze({
          ...namespace,
          roles: freeze({
            enable: flattenRoleReferences({
              owner: `${environment}:${path}`,
              references: namespace.roles.enable,
              define,
            }),
          }),
        }),
      ] as const;
    }),
  );

  return freeze({ namespaces: freeze(normalized), define: freeze(define) });
}
