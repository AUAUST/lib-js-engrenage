import { map, toDeduplicated } from "@auaust/toolkit/array";

import {
  getEnvironmentCoverage,
  type EnvironmentPlacements,
} from "#batiment/environments/index";
import type { Directory } from "#types/Directory";

function isWithin(path: Directory, dir: Directory): boolean {
  return path === dir || path.startsWith(`${dir}/`);
}

// @debt maps placements to the namespace directory holding them here, beside listNamespaceEnvironments' own walk over the same coverage, instead of one environments helper both read
/**
 * Lists, by directory of a namespace, the environments covering it: the one
 * placed at or above it, and those placed below it outside a nested directory
 * of the namespace.
 */
export function listDirectoryEnvironments(
  placements: EnvironmentPlacements,
  directories: readonly Directory[],
): ReadonlyMap<Directory, readonly string[]> {
  return new Map(
    map(directories, (directory) => {
      const {
        environment,
        nested,
      } = getEnvironmentCoverage(placements, directory);

      const inner = directories.filter((other) => {
        return other !== directory && isWithin(other, directory);
      });

      const own = nested.filter(({ dir }) => {
        return !inner.some((other) => isWithin(dir, other));
      });

      return [
        directory,
        toDeduplicated([
          ...(environment === undefined ? [] : [environment]),
          ...map(own, (placement) => placement.environment),
        ]),
      ] as const;
    }),
  );
}
