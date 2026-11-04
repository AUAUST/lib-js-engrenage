import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { debt } from "#bin/engrenage/debt";
import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";
import { runCommand } from "#tests/utils/runCommand";

beforeEach(() => {
  mockCwd(getFixture("debt"));

  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("engrenage debt", () => {
  test("prints one line per marker, ignoring malformed markers", async () => {
    await runCommand(debt);

    expect(console.info).toHaveBeenCalledExactlyOnceWith(
      "src/marked.ts:1  first marker in a source file",
    );

    expect(process.exitCode).toBeUndefined();
  });

  test("prints the markers as JSON", async () => {
    await runCommand(debt, "--json");

    expect(
      JSON.parse(String(vi.mocked(console.info).mock.calls[0]?.[0])),
    ).toEqual([
      {
        file: "src/marked.ts",
        line: 1,
        column: 1,
        statement: "first marker in a source file",
      },
    ]);
  });
});
