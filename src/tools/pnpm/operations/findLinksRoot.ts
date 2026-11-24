import { dirname } from "node:path";

import { pathExists, resolve } from "#foundation/filesystem/index";
import { linksFile } from "#tools/pnpm/constants";
import type { Directory } from "#types/Directory";

/**
 * The nearest directory from `start` up holding a links record, found without
 * loading the project's config, which may need the linked checkout to load;
 * `undefined` without one.
 */
// @debt a second project-root lookup beside config loading's own, so the two can disagree on nested projects
export async function findLinksRoot(
  start: Directory,
): Promise<Directory | undefined> {
  if (await pathExists(resolve(start, linksFile))) {
    return start;
  }

  const parent = dirname(start);

  return parent === start ? undefined : findLinksRoot(parent);
}
