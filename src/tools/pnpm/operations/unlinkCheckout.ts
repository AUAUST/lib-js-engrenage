import { omit } from "@auaust/toolkit/object";

import { pointPackageLink } from "#tools/pnpm/operations/pointPackageLink";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import { readPackageSymlink } from "#tools/pnpm/operations/readPackageSymlink";
import { writeLinks } from "#tools/pnpm/operations/writeLinks";
import type { Directory } from "#types/Directory";

/**
 * Repoints the package linked for `short` at its installed target and drops the
 * record, whether or not its checkout still exists.
 *
 * @throws {Error} When no link is recorded for `short`.
 */
export async function unlinkCheckout(
  root: Directory,
  short: string,
): Promise<void> {
  const links = await readLinks(root);

  const link = links[short];

  if (link === undefined) {
    throw new Error(`No link is recorded for \`${short}\``);
  }

  const { path } = await readPackageSymlink(root, link.package);

  await pointPackageLink(path, link.installed);

  await writeLinks(root, omit(links, short));
}
