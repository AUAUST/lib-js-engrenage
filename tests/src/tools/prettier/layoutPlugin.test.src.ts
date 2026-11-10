import { format } from "prettier";
import { parsers } from "prettier/plugins/typescript";
import { describe, expect, test } from "vitest";

import { loadConfig } from "#project/config/operations/loadConfig";
import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import type { Config } from "#tools/prettier/types/Config";

async function formatWith(source: string, options?: Config): Promise<string> {
  const project = createTemporaryProject({
    "package.json": '{ "type": "module" }',
    "engrenage.config.ts": "export default {};\n",
  });

  const config = await createPrettierConfig(
    await loadConfig(project.root),
    options,
  );

  return format(source, {
    ...config,
    parser: "typescript",
  });
}

describe("layoutPlugin", () => {
  test("pads a declaration Prettier wraps past the print width, and formats its output unchanged", async () => {
    const source = `const before = 1;
const wrapped = [firstArgumentValue, secondArgumentValue, thirdArgumentValue, fourth];
const after = 2;
`;

    const output = await formatWith(source);

    expect(output).toBe(`const before = 1;

const wrapped = [
  firstArgumentValue,
  secondArgumentValue,
  thirdArgumentValue,
  fourth,
];

const after = 2;
`);

    expect(await formatWith(output)).toBe(output);
  });

  test("keeps the preprocess of a plugin overriding the same parser", async () => {
    const renaming = {
      parsers: {
        typescript: {
          ...parsers.typescript,
          preprocess(text: string) {
            return text.replaceAll("original", "renamed");
          },
        },
      },
    };

    const output = await formatWith(
      "const original = {\n  value: 1,\n};\nconst after = original;\n",
      { plugins: [renaming] },
    );

    expect(output).toBe(
      "const renamed = {\n  value: 1,\n};\n\nconst after = renamed;\n",
    );
  });

  test("leaves a prettier-ignore statement without edits", async () => {
    const source = `const before = 1;
// prettier-ignore
const ignored = { a: 1, b: 2, c: 3 };
// prettier-ignore
const kept = [
  1, 2,
];
`;

    expect(await formatWith(source)).toBe(source);
  });
});
