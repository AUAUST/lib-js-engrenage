import { sort } from "@auaust/toolkit/array";
import { entries, freeze } from "@auaust/toolkit/object";

import { getEnvironmentCoverage } from "#batiment/environments/utils/getEnvironmentCoverage";
import { rootScope } from "#batiment/scopes/constants";
import type { EnvironmentInstance } from "#batiment/environments/types/EnvironmentInstance";
import type { EnvironmentPlacement } from "#batiment/environments/types/EnvironmentPlacement";
import type { EnvironmentPlacements } from "#batiment/environments/types/EnvironmentPlacements";
import type { RegisteredEnvironment } from "#batiment/environments/types/RegisteredEnvironment";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";

function findScope(nearestFirst: Directories, path: string): Directory {
  return (
    nearestFirst.find((scope) => {
      return path === scope || path.startsWith(`${scope}/`);
    }) ?? rootScope
  );
}

function listNested(
  placements: EnvironmentPlacements,
  environment: string,
  dirs: Directories,
): readonly EnvironmentPlacement[] {
  const nested = new Map<Directory, EnvironmentPlacement>();

  for (const dir of dirs) {
    for (const placement of getEnvironmentCoverage(placements, dir).nested) {
      if (placement.environment !== environment) {
        nested.set(placement.dir, placement);
      }
    }
  }

  return freeze([...nested.values()]);
}

/**
 * Forms one instance per registered environment and scope its placements
 * reach, in registration order, then in the order of `scopes`, the workspace
 * directories beside the root's: each placement belongs to the nearest scope at
 * or above it. An instance is active when it has a file placement or one of its
 * directories is in `activeDirs`.
 */
export function listEnvironmentInstances(
  registered: readonly RegisteredEnvironment[],
  placements: EnvironmentPlacements,
  scopes: Directories,
  activeDirs: ReadonlySet<Directory>,
): readonly EnvironmentInstance[] {
  const nearestFirst = sort(
    scopes.filter((scope) => scope !== rootScope),
    (left, right) => right.length - left.length,
  );

  const order = [rootScope, ...scopes.filter((scope) => scope !== rootScope)];

  const placed = [
    ...entries(placements.dirs).map(([path, environment]) => {
      return {
        environment,
        kind: "dirs",
        path,
      } as const;
    }),
    ...entries(placements.files).map(([path, environment]) => {
      return {
        environment,
        kind: "files",
        path,
      } as const;
    }),
  ];

  return freeze(
    registered.flatMap(({ registration: { name } }) => {
      const own = placed
        .filter(({ environment }) => environment === name)
        .map((placement) => {
          return {
            ...placement,
            scope: findScope(nearestFirst, placement.path),
          };
        });

      return order.flatMap((scope) => {
        const inScope = own.filter((placement) => placement.scope === scope);

        if (inScope.length === 0) {
          return [];
        }

        const dirs = inScope
          .filter(({ kind }) => kind === "dirs")
          .map(({ path }) => path);

        const files = inScope
          .filter(({ kind }) => kind === "files")
          .map(({ path }) => path);

        return [
          freeze({
            environment: name,
            scope,
            dirs: freeze(dirs),
            files: freeze(files),
            nested: listNested(placements, name, dirs),
            active: files.length > 0 || dirs.some((dir) => activeDirs.has(dir)),
          }),
        ];
      });
    }),
  );
}
