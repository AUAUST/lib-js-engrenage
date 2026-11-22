import { formatRecordDocument } from "#metalbrain/records/utils/formatRecordDocument";
import type { Filesystem } from "#foundation/filesystem/index";
import type { FoundRecord } from "#metalbrain/records/types/FoundRecord";

/**
 * Stages the removal of the `found` entry from its group file, removing the file
 * once it holds no entry, and leaving the index as it is.
 *
 * @returns Whether the group file was removed.
 */
export async function removeRecordEntry(
  filesystem: Filesystem,
  { file, document, entries, position }: FoundRecord,
): Promise<boolean> {
  entries.delete(position);

  if (entries.items.length === 0) {
    await filesystem.remove(file);

    return true;
  }

  await filesystem.write(file, formatRecordDocument(document));

  return false;
}
