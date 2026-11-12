import { describe, expect, test } from "vitest";

import { applyJsonEdits } from "#foundation/json/utils/applyJsonEdits";
import { jsonIndentation } from "#project/format/constants";

const content = `{
  "compilerOptions": {
    "paths": { "alias": ["./src/index.ts"] }
  },
  "references": [{ "path": "./tsconfig.src.json" }]
}
`;

describe("applyJsonEdits", () => {
  test("keeps the formatting of objects that already hold the value", () => {
    expect(
      applyJsonEdits(
        content,
        "tsconfig.json",
        [
          {
            path: ["compilerOptions", "paths"],
            value: { alias: ["./src/index.ts"] },
          },
        ],
        jsonIndentation,
      ),
    ).toBe(content);
  });

  test("keeps the formatting of objects nested in arrays", () => {
    expect(
      applyJsonEdits(
        content,
        "tsconfig.json",
        [
          {
            path: ["references"],
            value: [{ path: "./tsconfig.src.json" }],
          },
        ],
        jsonIndentation,
      ),
    ).toBe(content);
  });
});
