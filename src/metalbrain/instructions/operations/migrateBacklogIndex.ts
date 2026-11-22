import { backlogIndex } from "#metalbrain/backlog/constants";
import {
  backlogCategoriesHeading,
  backlogTemplate,
} from "#metalbrain/instructions/constants";
import { formatBacklogIndex } from "#metalbrain/instructions/utils/formatBacklogIndex";
import { formatReferenceMarker } from "#metalbrain/instructions/utils/formatReferenceMarker";
import type { Filesystem } from "#foundation/filesystem/index";

/**
 * Drops the category list the backlog index page rendered before `index.yml`
 * replaced it, and replaces inline instructions with the template block.
 */
export async function migrateBacklogIndex(
  filesystem: Filesystem,
): Promise<void> {
  const content = await filesystem.read(backlogIndex);

  if (content === undefined) {
    return;
  }

  const lines = content.split("\n");
  const heading = lines.indexOf(backlogCategoriesHeading);

  const kept = heading === -1 ? lines : lines.slice(0, heading);

  const migrated = content.includes(formatReferenceMarker(backlogTemplate))
    ? `${kept.join("\n").trimEnd()}\n`
    : formatBacklogIndex(lines[0] ?? "");

  if (migrated !== content) {
    await filesystem.write(backlogIndex, migrated);
  }
}
