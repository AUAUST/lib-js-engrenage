import { renamedRecordIdsFile } from "#metalbrain/records/constants";
import { readRenamedRecordIds } from "#metalbrain/records/operations/readRenamedRecordIds";
import { isLegacyRecordId } from "#metalbrain/records/utils/isLegacyRecordId";
import { parseRecordId } from "#metalbrain/records/utils/parseRecordId";
import type { Filesystem } from "#foundation/filesystem/index";

/**
 * The current ID of the entry `id` names: `id` itself, or for a former
 * `YYMMDD-xxxx` ID, the ID `.ai/renamed-ids.yml` maps it to, the one in
 * `namespace` when entries of several kinds shared it.
 *
 * @throws {Error} When `id` is a former ID the file does not map, or one entries
 * of several kinds shared and no `namespace` picks one of them.
 */
export async function resolveRecordId(
  filesystem: Filesystem,
  id: string,
  namespace?: string,
): Promise<string> {
  if (!isLegacyRecordId(id)) {
    return id;
  }

  const mapping = await readRenamedRecordIds(filesystem);

  const renamed = mapping.get(id) ?? [];

  const [first, ...others] = renamed;

  if (first === undefined) {
    throw new Error(
      `No entry ${id}: ${renamedRecordIdsFile} maps no former ID ${id} to a current one`,
    );
  }

  const picked = renamed.find((candidate) => {
    return parseRecordId(candidate)?.namespace === namespace;
  });

  if (picked !== undefined || others.length === 0) {
    return picked ?? first;
  }

  throw new Error(
    `${id} named entries of several kinds, now ${renamed.join(", ")}: pass one of these IDs`,
  );
}
