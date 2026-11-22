import { posix } from "node:path";

import {
  backlogCategoryExtension,
  backlogDirectory,
} from "#tools/agents/constants";
import { parseBacklogCategory } from "#tools/agents/utils/parseBacklogCategory";
import type { Filesystem } from "#foundation/filesystem/index";

/**
 * Every `.ai/backlog/<category>.yml`, in name order, read through the backlog
 * file schema as `parseBacklogCategory` reads it.
 */
export async function readBacklogCategories(filesystem: Filesystem) {
  const files = await filesystem.glob(
    `${backlogDirectory}/*${backlogCategoryExtension}`,
  );

  return Promise.all(
    files.map(async (file) => {
      const content = await filesystem.read(file);

      if (content === undefined) {
        throw new Error(`${file}: listed by the backlog glob but unreadable`);
      }

      return {
        file,
        name: posix.basename(file, backlogCategoryExtension),
        ...parseBacklogCategory(content),
      };
    }),
  );
}
