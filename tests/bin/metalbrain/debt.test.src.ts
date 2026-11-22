import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { binaryTimeout } from "#tests/utils/binaryTimeout";
import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";
import { runDefinition } from "#tests/utils/runDefinition";

import debt from "#bin/metalbrain/debt";

beforeEach(() => {
  mockCwd(getFixture("debt"));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("metalbrain debt", { timeout: binaryTimeout }, () => {
  test("prints one line per marker, ignoring malformed markers", async () => {
    const { messages } = await runDefinition(debt);

    expect(messages).toStrictEqual([
      {
        level: "log",
        text: "src/marked.ts:1  first marker in a source file",
        data: undefined,
      },
    ]);

    expect(process.exitCode).toBeUndefined();
  });

  test("prints the markers as JSON", async () => {
    const { messages } = await runDefinition(debt, "--json");

    expect(messages).toHaveLength(1);

    expect(messages[0]?.level).toBe("log");

    expect(JSON.parse(messages[0]?.text ?? "")).toEqual([
      {
        file: "src/marked.ts",
        line: 1,
        column: 1,
        statement: "first marker in a source file",
      },
    ]);
  });
});
