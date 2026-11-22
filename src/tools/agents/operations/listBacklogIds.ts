import { readBacklogCategories } from "#tools/agents/operations/readBacklogCategories";
import type { Filesystem } from "#foundation/filesystem/index";

/**
 * Every entry ID the parsable `.ai/backlog/*.yml` categories hold, valid or not.
 */
export async function listBacklogIds(
  filesystem: Filesystem,
): Promise<Set<string>> {
  const ids = new Set<string>();

  for (const category of await readBacklogCategories(filesystem)) {
    if (category.kind === "invalid") {
      continue;
    }

    for (const { loose } of category.entries) {
      if (loose.id !== undefined) {
        ids.add(loose.id);
      }
    }
  }

  return ids;
}
