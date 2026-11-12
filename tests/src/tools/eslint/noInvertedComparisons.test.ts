import { describe, expect, test } from "vitest";

import { createProjectLinter } from "#tests/utils/createProjectLinter";

const file = "src/feature/utils/check.ts";

const ruleId = "auaust/no-inverted-boolean-check";

async function createLinter() {
  const {
    lint,
  } = await createProjectLinter(`export default { preset: "library" };\n`);

  return async (condition: string) => {
    const source = `export const checked = ${condition};\n`;

    const messages = await lint(file, ruleId, source);

    return messages.map(({ fix }) => {
      return fix === undefined
        ? undefined
        : `${source.slice(0, fix.range[0])}${fix.text}${source.slice(fix.range[1])}`;
    });
  };
}

describe("no-inverted-boolean-check", () => {
  test("inverts a negated equality", async () => {
    const lint = await createLinter();

    expect(await lint("!(content !== undefined)")).toStrictEqual([
      "export const checked = (content === undefined);\n",
    ]);
  });

  test("keeps the parentheses a surrounding operator needs", async () => {
    const lint = await createLinter();

    expect(await lint("!(count === 1) + 1 > 0")).toStrictEqual([
      "export const checked = (count !== 1) + 1 > 0;\n",
    ]);
  });

  test("reports a negated relation without fixing it", async () => {
    const lint = await createLinter();

    expect(await lint("!(count < 1)")).toStrictEqual([undefined]);
  });
});
