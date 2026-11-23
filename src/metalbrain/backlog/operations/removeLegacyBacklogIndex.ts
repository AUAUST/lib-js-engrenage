import { legacyBacklogIndex } from "#metalbrain/backlog/constants";
import type { Filesystem } from "#foundation/filesystem/index";

/**
 * Stages the removal of the `index.md` page that guided agents through the
 * backlog before its commands and `index.yml` replaced it.
 */
export async function removeLegacyBacklogIndex(
  filesystem: Filesystem,
): Promise<void> {
  await filesystem.remove(legacyBacklogIndex);
}
