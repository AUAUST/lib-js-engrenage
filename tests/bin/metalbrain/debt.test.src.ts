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

  test("states the markers as data", async () => {
    const { entries } = await runDefinition(debt);

    expect(entries).toMatchObject([
      {
        kind: "data",
        value: [
          {
            file: "src/marked.ts",
            line: 1,
            column: 1,
            statement: "first marker in a source file",
          },
        ],
      },
    ]);
  });
});
