import { describe, expect, test } from "vitest";

import { listTableCells } from "#foundation/markdown/index";

describe("listTableCells", () => {
  test("lists each cell with its line, escaped pipes in code spans and tables in list items included", () => {
    const content = [
      "| Key | Value |",
      "| --- | --- |",
      "| `a \\| b` | c |",
      "",
      "- Item",
      "",
      "  | X |",
      "  | - |",
      "  | y |",
    ].join("\n");

    expect(listTableCells(content)).toEqual([
      { line: 1, text: "Key" },
      { line: 1, text: "Value" },
      { line: 3, text: "`a \\| b`" },
      { line: 3, text: "c" },
      { line: 7, text: "X" },
      { line: 9, text: "y" },
    ]);
  });

  test("lists no cell of a pipe table inside a fenced block", () => {
    expect(
      listTableCells(["```md", "| a | b |", "| - | - |", "```"].join("\n")),
    ).toEqual([]);
  });
});
