import { posix } from "node:path";

import { getOwn } from "@auaust/toolkit/object";

import { getDirectoryEnvironment } from "#batiment/environments/utils/getDirectoryEnvironment";
import type { EnvironmentPlacements } from "#batiment/environments/types/EnvironmentPlacements";
import type { File } from "#types/File";

/**
 * The environment of `file`, relative to the scope root: its file placement,
 * else its nearest directory placement, which replaces any enclosing one whole.
 */
export function getFileEnvironment(
  placements: EnvironmentPlacements,
  file: File,
): string | undefined {
  return (
    getOwn(placements.files, file) ??
    getDirectoryEnvironment(placements, posix.dirname(file))
  );
}
