import { isArray, isString } from "@auaust/toolkit";
import { filterMap } from "@auaust/toolkit/array";
import { max } from "@auaust/toolkit/math";

import {
  similarityThreshold,
  similarLimit,
} from "#foundation/matching/constants";
import { createTextQuery, rankDocuments } from "#foundation/matching/index";
import { prepareRecordSearch } from "#metalbrain/records/operations/prepareRecordSearch";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { SearchedRecord } from "#metalbrain/records/types/SearchedRecord";
import type { SimilarRecord } from "#metalbrain/records/types/SimilarRecord";
import type { Files } from "#types/Files";

function namesFile(
  { kind, entry }: SearchedRecord,
  files: ReadonlySet<string>,
): boolean {
  return Object.entries(kind.fields).some(([key, { type }]) => {
    const sites = entry[key];

    return (
      type === "sites" &&
      isArray(sites) &&
      sites.some((site) => {
        return isString(site) && files.has(site.replace(/:\d+$/u, ""));
      })
    );
  });
}

/**
 * At most `similarLimit` entries of `kinds`, but those `exclude` names, each
 * at `threshold` or more, `similarityThreshold` by default, similar to one of
 * `texts` as a text query, or with a site naming one of `files`; ordered by their
 * highest similarity, then newest `created` first.
 *
 * @throws {Error} As `prepareRecordSearch` throws.
 */
export async function findSimilarRecords(
  filesystem: Filesystem,
  kinds: readonly RecordKind[],
  {
    texts,
    files = [],
    exclude = [],
    threshold = similarityThreshold,
  }: {
    texts: readonly string[];
    files?: Files;
    exclude?: readonly string[];
    threshold?: number;
  },
): Promise<SimilarRecord[]> {
  const prepared = await prepareRecordSearch(filesystem, kinds);

  const similarities = new Map<SearchedRecord, number>();

  for (const text of texts) {
    const ranked = rankDocuments(prepared, createTextQuery(text, prepared));

    for (const { document, similarity } of ranked) {
      similarities.set(
        document,
        max(similarity, similarities.get(document) ?? 0),
      );
    }
  }

  const named = new Set<string>(files);

  const excluded = new Set(exclude);

  const similar = filterMap(prepared.documents, (record) => {
    const similarity = similarities.get(record) ?? 0;

    const kept = (
      !excluded.has(String(record.entry.id)) &&
      (similarity >= threshold || namesFile(record, named))
    );

    return kept ? { record, similarity } : undefined;
  });

  return similar
    .toSorted((first, second) => second.similarity - first.similarity)
    .slice(0, similarLimit);
}
