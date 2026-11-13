import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createProjectLinter } from "#tests/utils/createProjectLinter";

const definer = fileURLToPath(
  new URL("../../../../src/tools/eslint/index.ts", import.meta.url),
);

const file = "src/sample.ts";

const ruleId = "auaust/prefer-clock";

function createConfig(properties: readonly string[] | undefined): string {
  return `export default {
  extensions: [
    {
      name: "clock-extension",
      contributes: {
        "eslint.conventions": [
          {
            name: "preferClock",
            category: "clock",
            load: async () => {
              const { defineGlobalReplacement } = await import(${JSON.stringify(definer)});

              return defineGlobalReplacement({
                global: "Sample",
                properties: ${JSON.stringify(properties)},
                replacement: "\`clock\`",
              });
            },
          },
        ],
      },
    },
  ],
};
`;
}

async function createLinter(properties?: readonly string[]) {
  const { lint } = await createProjectLinter(createConfig(properties));

  return async (source: string) => {
    const messages = await lint(file, ruleId, `${source}\n`);

    return messages.map(({ line, message }) => {
      return { line, message };
    });
  };
}

describe("defineGlobalReplacement", () => {
  test("reports direct, computed and destructured access to listed properties", async () => {
    const lint = await createLinter(["now"]);

    const message = "Use `clock` instead of `Sample.now`.";

    expect(
      await lint(`export const direct = Sample.now();
export const computed = Sample["now"]();
const { now } = Sample;
export const destructured = now;
let assigned;
({ now: assigned } = Sample);
export const other = Sample.later;
export const { later } = Sample;
export const shadowed = { Sample }.Sample.now;`),
    ).toStrictEqual([
      { line: 1, message },
      { line: 2, message },
      { line: 3, message },
      { line: 6, message },
    ]);
  });

  test("reports every access when no property is listed", async () => {
    const lint = await createLinter();

    const message = "Use `clock` instead of `Sample.*`.";

    expect(
      await lint(`export const direct = Sample.later;
export const { later } = Sample;
export const computed = Other.now;`),
    ).toStrictEqual([
      { line: 1, message },
      { line: 2, message },
    ]);
  });
});
