import { isArray, isString } from "@auaust/toolkit";

import { createRecordTree } from "#metalbrain/kinds/utils/createRecordTree";
import {
  styled,
  type ReportSpan,
  type TreeEntry,
  type TreeNode,
} from "#nexus/reports/index";
import type { RecordKind, SearchedRecord } from "#metalbrain/records/index";

function formatValue(value: unknown): string {
  return isString(value) ? value : JSON.stringify(value);
}

function createFieldNode(key: string, value: unknown): TreeNode {
  return isArray(value)
    ? {
        label: `${key}:`,
        children: value.map((item) => {
          return { label: formatValue(item), children: [] };
        }),
      }
    : { label: `${key}: ${formatValue(value)}`, children: [] };
}

function createEntryNode(
  kind: RecordKind,
  { entry, created, taps }: SearchedRecord,
): TreeNode {
  const { id, ...fields } = entry;

  const title = kind.title === undefined ? undefined : fields[kind.title];

  const headline: ReportSpan[] = [styled("identifier", formatValue(id))];

  if (title !== undefined) {
    headline.push(" ", formatValue(title));
  }

  return {
    label: headline,
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
 * The tree of `records` as `createRecordTree` makes it, every entry headed by
 * its ID and its kind's title field, then each other field, its `created` and
 * its taps on a line under it, a list's items under their field.
 */
export function formatRecordDetailTree(
  records: readonly SearchedRecord[],
): TreeEntry {
  return createRecordTree(records, createEntryNode);
}
