import { getOwn } from "@auaust/toolkit/object";

import { readStructureMetadata } from "#batiment/context/operations/readStructureMetadata";
import { resolveStructure } from "#batiment/context/operations/resolveStructure";
import type { ContextDiscovery } from "#batiment/context/types/ContextDiscovery";
import type { ScopeDeclarations } from "#batiment/context/types/ScopeDeclarations";
import type {
  DeclaredNamespace,
  ResolvedStructure,
} from "#batiment/structure/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { Directory } from "#types/Directory";

export async function walkScope({
  dir,
  declarations,
  discovery,
  filesystem,
}: {
  dir: Directory;
  declarations: ScopeDeclarations;
  discovery: ContextDiscovery;
  filesystem: Filesystem;
}): Promise<ResolvedStructure> {
  const instances = getOwn(discovery.tree.scopes, dir)?.namespaces ?? [];

  const namespaces = await Promise.all(
    declarations.namespaces.map(
      async (namespace): Promise<DeclaredNamespace> => {
        const { name, declared } = namespace;

        const placement = instances.find((instance) => instance.name === name);

        if (placement === undefined) {
          throw new Error(
            `Scope "${dir}" declares the namespace ${name}, none of its active top-level namespaces`,
          );
        }

        const { dirs } = placement;

        const read = declared === undefined
          ? undefined
          : await readStructureMetadata({
              namespace: name,
              filesystem,
              dirs,
            });

        return {
          ...namespace,
          dirs,
          active: true,
          read,
        };
      },
    ),
  );

  return resolveStructure({
    filesystem,
    scope: dir,
    internals: declarations.internals,
    namespaces,
  });
}
