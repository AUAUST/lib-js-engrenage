import { posix } from "node:path";

import { parse } from "yaml";

import {
  backlogCategoryExtension,
  backlogDirectory,
} from "#tools/agents/constants";
import type { Filesystem } from "#foundation/filesystem/index";
import type { BacklogCategoryFile } from "#tools/agents/types/BacklogCategoryFile";

/**
 * Every `.ai/backlog/<category>.yml`, in name order.
 */
export async function readBacklogCategories(
  filesystem: Filesystem,
): Promise<BacklogCategoryFile[]> {
  const files = await filesystem.glob(
    `${backlogDirectory}/*${backlogCategoryExtension}`,
  );

  const categories: BacklogCategoryFile[] = [];

  for (const file of files) {
    const content = await filesystem.read(file);

    if (content === undefined) {
      throw new Error(`${file}: listed by the backlog glob but unreadable`);
    }

    const name = posix.basename(file, backlogCategoryExtension);

    try {
      categories.push({
        file,
        name,
        kind: "parsed",
        data: parse(content),
      });
    } catch (error) {
      categories.push({
        file,
        name,
        kind: "invalid",
        error,
      });
    }
  }

  return categories;
}
