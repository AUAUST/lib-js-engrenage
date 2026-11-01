import { describe, expect, test } from "vitest";

import { loadConfig } from "@auaust/engrenage/config";

import { listDebtMarkers } from "#eslint/utils/listDebtMarkers";
import { getFixture } from "#tests/helpers/getFixture";
import { mockCwd } from "#tests/helpers/mockCwd";

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
