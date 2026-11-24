import { rm } from "node:fs/promises";
import { dirname } from "node:path";

import { omit } from "@auaust/toolkit/object";

import { pathExists, resolve } from "#foundation/filesystem/index";
import { pointPackageExecutables } from "#tools/pnpm/operations/pointPackageExecutables";
import { pointSymlink } from "#tools/pnpm/operations/pointSymlink";
import { readLinks } from "#tools/pnpm/operations/readLinks";
import { readPackageManifest } from "#tools/pnpm/operations/readPackageManifest";
import { readPackageSymlink } from "#tools/pnpm/operations/readPackageSymlink";
import { writeLinks } from "#tools/pnpm/operations/writeLinks";
import { listExecutableLinks } from "#tools/pnpm/utils/listExecutableLinks";
import type { Link } from "#tools/pnpm/types/Link";
import type { Directory } from "#types/Directory";

async function removeCheckoutExecutables(
  root: Directory,
  { directory }: Link,
  kept: ReadonlySet<string>,
) {
  if (!(await pathExists(directory))) {
    return;
  }

  const links = listExecutableLinks(root, await readPackageManifest(directory));

  for (const { path } of links) {
    if (!kept.has(path)) {
      await rm(path, { force: true });
    }
  }
}

/**
 * Repoints the package linked for `short` and its executables at its installed
 * target, removes the executables only its checkout declares, and drops the
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

  await pointSymlink(path, link.installed, "dir");

  const installed = await readPackageManifest(
    resolve(dirname(path), link.installed),
  );

  await pointPackageExecutables(root, installed);

  const kept = listExecutableLinks(root, installed).map((executable) => {
    return executable.path;
  });

  await removeCheckoutExecutables(root, link, new Set(kept));

  await writeLinks(root, omit(links, short));
}
