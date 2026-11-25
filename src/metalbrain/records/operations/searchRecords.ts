import {
  createTextQuery,
  parseQuery,
  rankDocuments,
  type QueryNode,
} from "#foundation/matching/index";
import { prepareRecordSearch } from "#metalbrain/records/operations/prepareRecordSearch";
import type { Filesystem } from "#foundation/filesystem/index";
import type { RecordKind } from "#metalbrain/records/types/RecordKind";
import type { RecordQuery } from "#metalbrain/records/types/RecordQuery";

const explicitAnd = /(?:^|[\s(])AND(?=[\s)]|$)/u;

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
  const prepared = await prepareRecordSearch(filesystem, kinds);

  if (query.kind === "text") {
    return {
      relaxed: false,
      entries: rankDocuments(prepared, createTextQuery(query.text, prepared)),
    };
  }

  const tree = parseQuery(
    query.query,
    prepared.fields.map(({ name }) => name),
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
