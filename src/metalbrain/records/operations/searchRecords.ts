import { isArray, isString } from "@auaust/toolkit";

import {
  createTextQuery,
  parseQuery,
  prepareDocuments,
  rankDocuments,
  type DocumentField,
  type QueryNode,
} from "#foundation/matching/index";
import { listRecords } from "#metalbrain/records/operations/listRecords";
import type { Filesystem } from "#foundation/filesystem/index";
import type { ListedRecord } from "#metalbrain/records/types/ListedRecord";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { RecordQuery } from "#metalbrain/records/types/RecordQuery";

interface SearchedEntry extends ListedRecord {
  readonly kind: RecordKind;
}

const explicitAnd = /(?:^|[\s(])AND(?=[\s)]|$)/u;

function readText(value: unknown): string {
  if (isArray(value)) {
    return value.filter(isString).join("\n");
  }

  return isString(value) ? value : "";
}

function readField(
  { kind, group, entry }: SearchedEntry,
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
): DocumentField<SearchedEntry>[] {
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

function relaxImplicitAnd(
  tree: QueryNode,
  query: string,
): QueryNode | undefined {
  if (tree.kind !== "all") {
    return;
  }

  const kept = tree.children.filter((child) => {
    return child.kind !== "not";
  });

  // @debt reading an explicit `AND` from the raw query restates the parser's operator rule, since the query tree does not tell an explicit `AND` from an implicit one
  if (kept.length < 2 || explicitAnd.test(query)) {
    return;
  }

  return {
    kind: "all",
    children: [
      {
        kind: "any",
        children: kept,
        min: 1,
      },
      ...tree.children.filter((child) => {
        return child.kind === "not";
      }),
    ],
  };
}

/**
 * The entries of `kinds` matching `query`, ranked together on the fields each
 * kind's `search` weighs, each with its kind, score and similarity; ties keep
 * the newest `created` first. An implicit-`AND` query nothing matches ranks the
 * entries matching any of its terms instead, `relaxed` then `true` when any does.
 *
 * @throws {Error} When a kind declares no searchable field or weighs one it
 * lacks, two kinds weigh a field differently, a query in the query syntax holds
 * no term, or a group file read is unparsable.
 */
export async function searchRecords(
  filesystem: Filesystem,
  kinds: readonly RecordKind[],
  query: RecordQuery,
) {
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

  const prepared = prepareDocuments(newestFirst, fields);

  if (query.kind === "text") {
    return {
      relaxed: false,
      entries: rankDocuments(prepared, createTextQuery(query.text, prepared)),
    };
  }

  const tree = parseQuery(
    query.query,
    fields.map(({ name }) => name),
  );

  if (tree.kind === "all" && tree.children.length === 0) {
    throw new Error(`The query "${query.query}" holds no term to search`);
  }

  const entries = rankDocuments(prepared, tree);

  const relaxedTree = entries.length === 0
    ? relaxImplicitAnd(tree, query.query)
    : undefined;

  const relaxed = relaxedTree === undefined
    ? []
    : rankDocuments(prepared, relaxedTree);

  return relaxed.length === 0
    ? { relaxed: false, entries }
    : { relaxed: true, entries: relaxed };
}
