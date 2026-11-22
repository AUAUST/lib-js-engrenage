import {
  backlog,
  backlogDirectory,
  backlogIndex,
  legacyBacklogExtension,
} from "#metalbrain/backlog/constants";
import { createRecordGroup } from "#metalbrain/records/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";

/**
 * Stages the backlog category `name` with `purpose` and no entries, as
 * `createRecordGroup` does, unless a legacy `.md` category holds the name.
 *
 * @throws {Error} When a legacy category holds `name`, or `createRecordGroup`
 * refuses it.
 */
export async function createBacklogCategory(
  filesystem: Filesystem,
  name: string,
  purpose: string,
): Promise<File> {
  const legacy = `${backlogDirectory}/${name}${legacyBacklogExtension}` satisfies File;

  if (legacy !== backlogIndex && (await filesystem.exists(legacy))) {
    throw new Error(`Backlog category "${name}" already exists: ${legacy}`);
  }

  return createRecordGroup(filesystem, backlog, name, purpose);
}
