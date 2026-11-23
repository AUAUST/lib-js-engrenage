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
  const namespaces = await Promise.all(
    declarations.namespaces.map(
      async (namespace): Promise<DeclaredNamespace> => {
        const { name, declared } = namespace;

        const placement = getOwn(discovery.namespaces, name);

        if (placement === undefined) {
          throw new Error(
            `Scope "${dir}" declares the environment ${name}, which discovery never placed`,
          );
        }

        const { dirs, active } = placement;

        const read = declared === undefined || !active
          ? undefined
          : await readStructureMetadata({
              namespace: name,
              filesystem,
              dirs,
            });

        return {
          ...namespace,
          dirs,
          active,
          read,
        };
      },
    ),
  );

  return resolveStructure({
    filesystem,
    internals: declarations.internals,
    namespaces,
  });
}
