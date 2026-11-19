import { globSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { listTableCells } from "#foundation/markdown/index";
import { tableCellWords } from "#tools/agents/constants";
import { countWords } from "#tools/agents/utils/countWords";

const shippedData = fileURLToPath(
  new URL("../../../../data/", import.meta.url),
);

describe("fragment table cells", () => {
  test("no cell of a shipped fragment exceeds the table cell limit", () => {
    const fragments = globSync(["metalbrain/**/*.md"], { cwd: shippedData });

    const violations = fragments.flatMap((fragment) => {
      return listTableCells(readFileSync(`${shippedData}${fragment}`, "utf-8"))
        .filter(({ text }) => countWords(text) > tableCellWords)
        .map(({ line }) => `${fragment}:${line}`);
    });

    expect(fragments.length).toBeGreaterThan(0);

    expect(violations).toEqual([]);
  });
});
