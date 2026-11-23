import { getOwn } from "@auaust/toolkit/object";

import {
  readStructureMetadata,
  resolveStructure,
  type DeclaredEnvironment,
  type ResolvedStructure,
} from "#batiment/structure/index";
import type { ContextDiscovery } from "#batiment/context/types/ContextDiscovery";
import type { ScopeDeclarations } from "#batiment/context/types/ScopeDeclarations";
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
  const environments = await Promise.all(
    declarations.environments.map(
      async (environment): Promise<DeclaredEnvironment> => {
        const { name, declared } = environment;

        const placement = getOwn(discovery.environments, name);

        if (placement === undefined) {
          throw new Error(
            `Scope "${dir}" declares the environment ${name}, which discovery never placed`,
          );
        }

        const { dirs, active } = placement;

        const read = declared === undefined || !active
          ? undefined
          : await readStructureMetadata({
              environment: name,
              filesystem,
              dirs,
              metafiles: discovery.metafiles,
            });

        return {
          ...environment,
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
    environments,
  });
}
