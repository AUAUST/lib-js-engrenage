import { isArray, isString } from "@auaust/toolkit";

import {
  prepareDocuments,
  type DocumentField,
  type PreparedDocuments,
} from "#foundation/matching/index";
import { listRecords } from "#metalbrain/records/operations/listRecords";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { SearchedRecord } from "#metalbrain/records/types/SearchedRecord";

function readText(value: unknown): string {
  if (isArray(value)) {
    return value.filter(isString).join("\n");
  }

  return isString(value) ? value : "";
}

function readField(
  { kind, group, entry }: SearchedRecord,
  name: string,
): string {
  const { search } = kind;

  if (search?.weights[name] === undefined) {
    return "";
  }

  return name === search.group ? group : readText(entry[name]);
}

function createFields(
  kinds: readonly RecordKind[],
): DocumentField<SearchedRecord>[] {
  const weights = new Map<string, number>();

  for (const { name, search, fields } of kinds) {
    if (search === undefined) {
      throw new Error(
        `The ${name} records declare no searchable field: a kind declares them under \`search\``,
      );
    }

    for (const [field, weight] of Object.entries(search.weights)) {
      if (field !== "id" && field !== search.group && !(field in fields)) {
        throw new Error(
          `The ${name} records weigh "${field}" for search, which is neither \`id\`, its group nor one of its fields`,
        );
      }

      const known = weights.get(field);

      if (known !== undefined && known !== weight) {
        throw new Error(
          `Record kinds searched together weigh "${field}" ${known} and ${weight}: every kind declaring a field must give it one weight`,
        );
      }

      weights.set(field, weight);
    }
  }

  return Array.from(weights, ([name, weight]) => {
    return {
      name,
      weight,
      read(document) {
        return readField(document, name);
      },
    };
  });
}

/**
 * The entries of `kinds`, newest `created` first, prepared for any number of
 * rankings on the fields each kind's `search` weighs.
 *
 * @throws {Error} When a kind declares no searchable field or weighs one it
 * lacks, two kinds weigh a field differently, or a group file read is unparsable.
 */
export async function prepareRecordSearch(
  filesystem: Filesystem,
  kinds: readonly RecordKind[],
): Promise<PreparedDocuments<SearchedRecord>> {
  const fields = createFields(kinds);

  const listed = await Promise.all(
    kinds.map(async (kind) => {
      const entries = await listRecords(filesystem, kind);

      return entries.map((entry) => {
        return { ...entry, kind };
      });
    }),
  );

  const newestFirst = listed.flat().toSorted((first, second) => {
    return (second.created ?? "").localeCompare(first.created ?? "");
  });

  return prepareDocuments(newestFirst, fields);
}
