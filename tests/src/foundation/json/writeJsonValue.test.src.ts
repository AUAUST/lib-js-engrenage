import { describe, expect, test } from "vitest";

import { writeJsonValue } from "#foundation/json/utils/writeJsonValue";

describe("writeJsonValue", () => {
  test("indents with tabs when the indentation asks for them", () => {
    expect(
      writeJsonValue("{}\n", "file.json", ["a", "b"], 1, {
        insertSpaces: false,
        tabSize: 2,
      }),
    ).toBe('{\n\t"a": {\n\t\t"b": 1\n\t}\n}\n');
  });
});
