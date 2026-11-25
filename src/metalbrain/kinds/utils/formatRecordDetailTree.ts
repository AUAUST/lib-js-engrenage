import { isArray, isString } from "@auaust/toolkit";

import { paintRecordTree } from "#metalbrain/kinds/utils/paintRecordTree";
import type { RecordTreeNode } from "#metalbrain/kinds/types/RecordTreeNode";
import type { RecordKind, SearchedRecord } from "#metalbrain/records/index";

function formatValue(value: unknown): string {
  return isString(value) ? value : JSON.stringify(value);
}

function createFieldNode(key: string, value: unknown): RecordTreeNode {
  return isArray(value)
    ? {
        line: `${key}:`,
        children: value.map((item) => {
          return { line: formatValue(item), children: [] };
        }),
      }
    : { line: `${key}: ${formatValue(value)}`, children: [] };
}

function createEntryNode(
  kind: RecordKind,
  { entry, created, taps }: SearchedRecord,
): RecordTreeNode {
  const { id, ...fields } = entry;

  const title = kind.title === undefined ? undefined : fields[kind.title];

  const headline = [id, title].filter((part) => part !== undefined);

  return {
    line: headline.map(formatValue).join(" "),
    children: [
      ...Object.entries(fields)
        .filter(([key]) => key !== kind.title)
        .map(([key, value]) => createFieldNode(key, value)),
      ...(created === undefined ? [] : [createFieldNode("created", created)]),
      ...(taps.length === 0
        ? []
        : [
            createFieldNode(
              "taps",
              taps.map(({ at, note }) => {
                return note === undefined ? at : `${at} ${note}`;
              }),
            ),
          ]),
    ],
  };
}

/**
 * The lines painting `records` as `paintRecordTree` does, every entry headed by
 * its ID and its kind's title field, then each other field, its `created` and
 * its taps on a line under it, a list's items under their field.
 */
export function formatRecordDetailTree(
  records: readonly SearchedRecord[],
): string[] {
  return paintRecordTree(records, createEntryNode);
}
