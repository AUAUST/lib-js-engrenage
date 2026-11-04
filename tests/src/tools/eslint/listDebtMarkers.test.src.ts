import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";
import { listDebtMarkers } from "#tools/eslint/operations/listDebtMarkers";

describe("listDebtMarkers", () => {
  test("lists well-formed markers of linted files only", async () => {
    const root = getFixture("debt");

    mockCwd(root);

    expect(await listDebtMarkers(await loadConfig(root))).toEqual([
      {
        file: "src/marked.ts",
        line: 1,
        column: 1,
        statement: "first marker in a source file",
      },
    ]);
  });
});
