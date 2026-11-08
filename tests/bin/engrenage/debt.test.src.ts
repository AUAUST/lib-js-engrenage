import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { getFixture } from "#tests/utils/getFixture";
import { mockCwd } from "#tests/utils/mockCwd";

import debt from "#bin/engrenage/actions/debt";

beforeEach(() => {
  mockCwd(getFixture("debt"));

  vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("engrenage debt", () => {
  test("prints one line per marker, ignoring malformed markers", async () => {
    await debt({ json: false });

    expect(console.info).toHaveBeenCalledExactlyOnceWith(
      "src/marked.ts:1  first marker in a source file",
    );

    expect(process.exitCode).toBeUndefined();
  });

  test("prints the markers as JSON", async () => {
    await debt({ json: true });

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
