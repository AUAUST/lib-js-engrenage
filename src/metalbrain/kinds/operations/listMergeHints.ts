import { isArray, isString } from "@auaust/toolkit";

import { formatRecordLine } from "#metalbrain/kinds/utils/formatRecordLine";
import {
  findRecord,
  findSimilarRecords,
  type RecordKind,
} from "#metalbrain/records/index";
import type { Filesystem } from "#foundation/filesystem/index";

/**
 * The lines listing the entries of `kind` similar to its entry `id`, as
 * `findSimilarRecords` finds them from the entry's field values, each followed
 * by the command merging `id` into it, or, for a kind taking no taps, followed
 * by the command closing `id`; none when no entry is similar.
 *
 * @throws {Error} When `findRecord` finds no entry `id`, or as
 * `findSimilarRecords` throws.
 */
export async function listMergeHints(
  filesystem: Filesystem,
  kind: RecordKind,
  id: string,
  { keywords = [] }: { keywords?: readonly string[] } = {},
): Promise<string[]> {
  const { entry } = await findRecord(filesystem, kind, id);

  const text = Object.keys(kind.fields)
    .flatMap((key) => {
      const value = entry[key];

      if (isArray(value)) {
        return value.filter(isString);
      }

      return isString(value) ? value : [];
    })
    .join("\n");

  const similar = await findSimilarRecords(filesystem, [kind], {
    texts: keywords.length > 0 ? [text, keywords.join("\n")] : [text],
    exclude: [id],
  });

  if (similar.length === 0) {
    return [];
  }

  if (kind.taps !== true) {
    return [
      `Similar ${kind.name} entries; close ${id} if one records the same thing:`,
      ...similar.map(({ record }) => formatRecordLine(kind, record)),
      `  pnpm metalbrain ${kind.name} close ${id}`,
    ];
  }

  return [
    `Similar ${kind.name} entries; merge ${id} into the one recording the same thing, if any:`,
    ...similar.flatMap(({ record }) => {
      return [
        formatRecordLine(kind, record),
        `  pnpm metalbrain ${kind.name} merge ${id} ${String(record.entry.id)}`,
      ];
    }),
  ];
}
