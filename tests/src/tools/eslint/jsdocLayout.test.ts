import { ESLint } from "eslint";
import { format } from "prettier";
import { describe, expect, test } from "vitest";

import { createEslintConfig } from "@auaust/engrenage/eslint";
import { loadConfig } from "@auaust/engrenage/extensions";

import { createTemporaryProject } from "#tests/utils/createTemporaryProject";
import { formatWithPrettierConfig } from "#tests/utils/formatWithPrettierConfig";

async function formatJsdoc(source: string) {
  const project = createTemporaryProject({
    "package.json": '{ "type": "module" }',
    "engrenage.config.ts": "export default {};\n",
  });

  const eslint = new ESLint({
    cwd: project.root,
    overrideConfigFile: true,
    overrideConfig: await createEslintConfig(await loadConfig(project.root), {
      typeAware: false,
    }),
    fix: ({ ruleId }) => ruleId?.startsWith("auaust/jsdoc-") === true,
  });

  const [result] = await eslint.lintText(source, {
    filePath: project.resolve("src/example.ts"),
  });

  expect(result?.fatalErrorCount).toBe(0);

  expect(
    result?.messages.filter(({ ruleId }) => {
      return ruleId?.startsWith("auaust/jsdoc-");
    }),
  ).toStrictEqual([]);

  return result?.output ?? source;
}

describe("JSDoc layout", () => {
  test.each([
    [
      "/** Foo */\nexport const foo = 1;\n",
      "/**\n * Foo\n */\nexport const foo = 1;\n",
    ],
    [
      "/** @type {number} */\nexport const foo = 1;\n",
      "/**\n * @type {number}\n */\nexport const foo = 1;\n",
    ],
    [
      "/**\n * Foo.\n * @param value Input.\n */\nfunction foo(value: string): void {}\n",
      "/**\n * Foo.\n *\n * @param value Input.\n */\nfunction foo(value: string): void {}\n",
    ],
    [
      "/**\n * @param value Input.\n * @description Foo.\n */\nfunction foo(value: string): void {}\n",
      "/**\n * @description Foo.\n * @param value Input.\n */\nfunction foo(value: string): void {}\n",
    ],
  ])("fixes %s", async (source, expected) => {
    const output = await formatJsdoc(source);

    expect(output).toBe(expected);

    expect(await formatJsdoc(output)).toBe(output);

    expect(await formatWithPrettierConfig(output)).toBe(
      await format(output, { parser: "typescript" }),
    );
  });

  test("preserves multiline tag bodies, custom tags and overload groups", async () => {
    const source = [
      "/**",
      " * Parse a value.",
      " *",
      " * @example",
      " * ```ts",
      ' * parse("value");',
      " * ```",
      " *",
      " * Another paragraph belonging to the example.",
      " * @customTool Some library metadata.",
      " * @overload",
      " * @param {string} value Text.",
      " * @returns {string} Parsed text.",
      " * @overload",
      " * @param {number} value Number.",
      " * @returns {number} Parsed number.",
      " */",
      "function parse(value) {}",
      "/** Text overload. */",
      "export function convert(value: string): string;",
      "/** Number overload. */",
      "export function convert(value: number): number;",
      "export function convert(value: string | number): string | number { return value; }",
      "",
    ].join("\n");

    const fixed = await formatJsdoc(source);

    expect(fixed).toContain(
      source.slice(0, source.indexOf("/** Text overload.")),
    );

    expect(fixed).toContain(
      "/**\n * Text overload.\n */\nexport function convert(value: string)",
    );

    expect(fixed).toContain(
      "/**\n * Number overload.\n */\nexport function convert(value: number)",
    );

    const formatted = await formatWithPrettierConfig(fixed);

    expect(await formatJsdoc(formatted)).toBe(formatted);

    expect(await formatWithPrettierConfig(formatted)).toBe(formatted);
  });
});
