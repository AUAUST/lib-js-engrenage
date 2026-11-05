import { format } from "prettier";
import { describe, expect, expectTypeOf, test } from "vitest";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { mockCwd } from "#tests/utils/mockCwd";
import { createPrettierConfig } from "#tools/prettier/operations/createPrettierConfig";
import { definePrettierConfig } from "#tools/prettier/operations/definePrettierConfig";
import { loadConfig } from "#workflows/registry/operations/loadConfig";
import type { Config } from "#tools/prettier/types/Config";

async function createContextOf(config: string) {
  const project = createTemporaryProject({
    "package.json": '{ "type": "module" }',
    "engrenage.config.ts": `export default ${config};\n`,
  });

  return await loadConfig(project.root);
}

describe("createPrettierConfig", () => {
  test("maps the format conventions and formats with them", async () => {
    const config = createPrettierConfig(await createContextOf("{}"));

    const output = await format("const value = {a: 'b', c: [1,2]}", {
      ...(await config),
      parser: "typescript",
    });

    expect(output).toBe('const value = { a: "b", c: [1, 2] };\n');
  });

  test("follows the configured conventions and lets a project override individual options", async () => {
    const context = await createContextOf(
      "{ format: { quotes: 'single', semicolons: false, lineWidth: 100 } }",
    );

    const config = await createPrettierConfig(context, { tabWidth: 4 });

    expectTypeOf(config).toEqualTypeOf<Config>();

    expect(config).toMatchObject({
      singleQuote: true,
      semi: false,
      printWidth: 100,
      tabWidth: 4,
    });
  });
});

describe("definePrettierConfig", () => {
  test("applies the plugins of prettier.config.ts when formatting, without engrenage reading that file", async () => {
    const project = createTemporaryProject({
      "package.json": '{ "type": "module" }',
      "engrenage.config.ts": "export default {};\n",
      "prettier.config.ts": 'throw new Error("read by engrenage");\n',
    });

    mockCwd(project.root);

    const upperCase = {
      parsers: {
        text: {
          astFormat: "text-ast",
          parse(text: string) {
            return { value: text };
          },
          locStart: () => 0,
          locEnd: () => 0,
        },
      },
      printers: {
        "text-ast": {
          print(path: { node: { value: string } }) {
            return path.node.value.toUpperCase();
          },
        },
      },
    };

    const config = await definePrettierConfig({ plugins: [upperCase] });

    expect(config.plugins).toEqual([upperCase]);

    expect(await format("abc", { ...config, parser: "text" })).toBe("ABC");
  });
});
