import { findPackageJSON } from "node:module";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

import { pathExists, resolve } from "#foundation/filesystem/index";
import { linksFile } from "#tools/pnpm/constants";
import type { Directory } from "#types/Directory";

/**
 * The directory of the project in the working directory when it records linked
 * checkouts, found with one stat past Node's own `package.json` lookup so a run
 * in a project without links loads nothing more; `undefined` otherwise.
 */
// @debt takes the nearest `package.json` as the project, while `engrenage link` takes the nearest links record (`findLinksRoot`), so a run from a workspace package below a root recording links neither restores nor sources them
export async function findLinkedConsumer(): Promise<Directory | undefined> {
  const manifest = findPackageJSON(pathToFileURL(`${process.cwd()}/`).href);

  if (manifest === undefined) {
    return;
  }

  const consumer = dirname(manifest);

  return (await pathExists(resolve(consumer, linksFile)))
    ? consumer
    : undefined;
}
