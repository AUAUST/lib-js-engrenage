import { entries } from "@auaust/toolkit/object";

import { pointPackageLink } from "#tools/pnpm/operations/pointPackageLink";
import { readLinkedPackage } from "#tools/pnpm/operations/readLinkedPackage";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import type { Directory } from "#types/Directory";

/**
 * Repoints every recorded package at its checkout, as after an install.
 *
 * @returns The short names of the restored links.
 */
export async function restoreLinks(root: Directory): Promise<string[]> {
  const restored: string[] = [];

  for (const [short, { directory }] of entries(await readLinks(root))) {
    const { path, resolved } = await readLinkedPackage(root, directory);

    if (resolved === directory) {
      continue;
    }

    await pointPackageLink(path, directory);

    restored.push(short);
  }

  return restored;
}
