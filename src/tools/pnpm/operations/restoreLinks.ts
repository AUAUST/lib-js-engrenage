import { entries } from "@auaust/toolkit/object";

import { inspectLink } from "#tools/pnpm/operations/inspectLink";
import { pointPackageExecutables } from "#tools/pnpm/operations/pointPackageExecutables";
import { pointSymlink } from "#tools/pnpm/operations/pointSymlink";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import { readPackageManifest } from "#tools/pnpm/operations/readPackageManifest";
import type { Directory } from "#types/Directory";

/**
 * Repoints every recorded package whose checkout exists, and its executables, at
 * that checkout, as after an install, adding the executables it gained since.
 *
 * @returns The short names of the restored links and of those whose
 * checkout is missing.
 */
// @debt concurrent runs, such as two commands started right after an install, stage each symlink at the same path and can fail on each other's
export async function restoreLinks(
  root: Directory,
): Promise<{ restored: string[]; missing: string[] }> {
  const restored: string[] = [];
  const missing: string[] = [];

  for (const [short, link] of entries(await readLinks(root))) {
    const { path, present, holds } = await inspectLink(root, link);

    if (!present) {
      missing.push(short);

      continue;
    }

    if (holds) {
      continue;
    }

    await pointSymlink(path, link.directory, "dir");

    await pointPackageExecutables(
      root,
      await readPackageManifest(link.directory),
    );

    restored.push(short);
  }

  return { restored, missing };
}
