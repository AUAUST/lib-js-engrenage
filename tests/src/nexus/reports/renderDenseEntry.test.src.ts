import { expect, test } from "vitest";

import {
  completionEntry,
  renderDenseEntry,
  styled,
  tableEntry,
  treeEntry,
} from "#nexus/reports/index";

const nodes = [
  {
    label: "root",
    children: [
      { label: "a", children: [{ label: "a1", children: [] }] },
      { label: [styled("path", "b")], children: [] },
    ],
  },
];

test("draws every level of a tree with ruled branches", () => {
  expect(renderDenseEntry(treeEntry(nodes))).toEqual([
    "root",
    "├─ a",
    "│  └─ a1",
    "└─ b",
  ]);
});

test("alternates branched and indented levels in a compact tree", () => {
  expect(renderDenseEntry(treeEntry(nodes, { compact: true }))).toEqual([
    "root",
    "├ a",
    "│ a1",
    "└ b",
  ]);
});

test("closes a completion line with the run's total time", () => {
  expect(renderDenseEntry(completionEntry("Done", 2345))).toEqual([
    "Done (2.35s)",
  ]);
});

test("renders nothing for a table without rows", () => {
  expect(
    renderDenseEntry(tableEntry({ columns: [{ align: "start" }], rows: [] })),
  ).toEqual([]);
});
