import { matchesGlob } from "node:path";

import { entries, freeze } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { createStructureEntity } from "#batiment/structure/utils/createStructureEntity";
import type { ResolvedRoles } from "#batiment/roles/index";
import type { LocatedEntity } from "#batiment/structure/types/LocatedEntity";
import type { RootFilesPlacement } from "#batiment/structure/types/RootFilesPlacement";

const projectRoot = ".";

/**
 * Locates a file at the project root in the active top-level namespace whose root
 * files match it, classified by that namespace's roles as a file of its root.
 */
export function createRootFileLocator(
  placements: Readonly<Record<string, RootFilesPlacement>>,
  rolesOf: (namespace: string) => ResolvedRoles,
): (path: string) => LocatedEntity | undefined {
  const owners = entries(placements)
    .filter(([, { active }]) => active)
    .map(([name, { rootFiles = [] }]) => {
      return freeze({
        globs: rootFiles,
        located: freeze({
          entity: createStructureEntity(name, projectRoot, rootScope),
          roles: rolesOf(name),
          named: freeze([]),
          covers: false,
        }),
      });
    });

  return function locateRootFile(path) {
    return owners.find(({ globs }) => {
      return globs.some((glob) => matchesGlob(path, glob));
    })?.located;
  };
}
