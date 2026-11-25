import { stringify } from "yaml";

import { isString } from "@auaust/toolkit";

import { backlogReferenceFiles } from "#metalbrain/backlog/constants";
import { recordKinds } from "#metalbrain/kinds/constants";
import { renamedRecordIdsFile } from "#metalbrain/records/constants";
import {
  createRecordId,
  isLegacyRecordId,
  listRecordIds,
  readRecordGroups,
  readRenamedRecordIds,
  writeRecordIndex,
  type RecordKind,
} from "#metalbrain/records/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

const quotePattern = /(?<![\w-])\d{6}-[\da-f]{4}(?![\w-])/gu;

interface KindRename {
  readonly files: readonly File[];
  readonly renamed: ReadonlyMap<string, string>;
}

async function renameKind(
  filesystem: Filesystem,
  kind: RecordKind,
): Promise<KindRename> {
  const taken = await listRecordIds(filesystem, kind);

  const files: File[] = [];

  const renamed = new Map<string, string>();

  for (const group of await readRecordGroups(filesystem, kind)) {
    files.push(group.file);

    if (group.kind === "invalid") {
      continue;
    }

    for (const { loose } of group.entries) {
      const { id } = loose;

      if (!isString(id) || !isLegacyRecordId(id)) {
        continue;
      }

      if (renamed.has(id)) {
        throw new Error(
          `Two ${kind.name} entries hold the ID ${id}, so no ID was renamed: close one, or give it a new ID by hand`,
        );
      }

      const next = createRecordId(kind, taken);

      taken.add(next);

      renamed.set(id, next);
    }
  }

  return { files, renamed };
}

async function rewriteQuotes(
  filesystem: Filesystem,
  files: readonly File[],
  rename: (former: string) => string | undefined,
) {
  for (const file of files) {
    const content = await filesystem.read(file);

    if (content === undefined) {
      continue;
    }

    const rewritten = content.replaceAll(quotePattern, (quote: string) => {
      return rename(quote) ?? quote;
    });

    if (rewritten !== content) {
      await filesystem.write(file, rewritten);
    }
  }
}

/**
 * Gives each entry of every record kind still holding a former `YYMMDD-xxxx`
 * ID a new ID of its kind, adds each former ID with its new ones to
 * `.ai/renamed-ids.yml`, rewrites each quote of a renamed ID, then regenerates
 * each kind's index. A kind's own files quote its own entry for a former ID
 * entries of several kinds shared; the agent records and `instructionFiles` keep
 * such a quote, which names no single entry.
 *
 * @returns Each former ID renamed, with its new IDs.
 * @throws {Error} When two entries of one kind hold the same former ID,
 * renaming nothing.
 */
export async function renameLegacyRecordIds(
  filesystem: Filesystem,
  instructionFiles: Globs,
): Promise<Map<string, readonly string[]>> {
  const kinds: KindRename[] = [];

  for (const kind of recordKinds) {
    kinds.push(await renameKind(filesystem, kind));
  }

  const renamed = new Map<string, string[]>();

  for (const kind of kinds) {
    for (const [former, next] of kind.renamed) {
      renamed.set(former, [...(renamed.get(former) ?? []), next]);
    }
  }

  if (renamed.size === 0) {
    return renamed;
  }

  const mapping = new Map([
    ...(await readRenamedRecordIds(filesystem)),
    ...renamed,
  ]);

  await filesystem.write(
    renamedRecordIdsFile,
    stringify(
      Object.fromEntries(
        [...mapping].map(([former, ids]) => {
          return [former, ids.length === 1 ? ids[0] : ids];
        }),
      ),
      { lineWidth: 0 },
    ),
  );

  function renameSingle(former: string): string | undefined {
    const ids = renamed.get(former);

    return ids?.length === 1 ? ids[0] : undefined;
  }

  for (const kind of kinds) {
    await rewriteQuotes(filesystem, kind.files, (former) => {
      return kind.renamed.get(former) ?? renameSingle(former);
    });
  }

  await rewriteQuotes(
    filesystem,
    await filesystem.glob([...backlogReferenceFiles, ...instructionFiles]),
    renameSingle,
  );

  for (const kind of recordKinds) {
    await writeRecordIndex(filesystem, kind);
  }

  return renamed;
}
