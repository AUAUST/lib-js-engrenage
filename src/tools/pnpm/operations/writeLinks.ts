import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { keys } from "@auaust/toolkit/object";

import { resolve } from "#foundation/filesystem/index";
import { linksFile } from "#tools/pnpm/constants";
import type { Links } from "#tools/pnpm/types/Links";
import type { Directory } from "#types/Directory";

/**
 * Records `links` for `root`, removing the record once it holds none.
 */
export async function writeLinks(root: Directory, links: Links): Promise<void> {
  const path = resolve(root, linksFile);

  if (keys(links).length === 0) {
    return void (await rm(path, { force: true }));
  }

  await mkdir(dirname(path), { recursive: true });

  await writeFile(path, `${JSON.stringify(links, undefined, 2)}\n`);
}
