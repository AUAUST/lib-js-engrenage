import { entries } from "@auaust/toolkit/object";

import { unlinkCommand } from "#tools/pnpm/constants";
import { inspectLink } from "#tools/pnpm/operations/inspectLink";
import { pointPackageExecutables } from "#tools/pnpm/operations/pointPackageExecutables";
import { pointSymlink } from "#tools/pnpm/operations/pointSymlink";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import { readPackageManifest } from "#tools/pnpm/operations/readPackageManifest";
import type { Directory } from "#types/Directory";

/**
 * Repoints every recorded package and its executables at its checkout, as
 * after an install.
 *
 * @returns The short names of the restored links.
 * @throws {Error} When a recorded checkout no longer exists.
 */
export async function restoreLinks(root: Directory): Promise<string[]> {
  const restored: string[] = [];

  for (const [short, link] of entries(await readLinks(root))) {
    const { path, present, holds } = await inspectLink(root, link);

    if (!present) {
      throw new Error(
        `The checkout ${link.directory} linked to ${short} is missing: run \`${unlinkCommand} ${short}\``,
      );
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

  return restored;
}
