import { describe, expect, test } from "vitest";

import { createProjectLinter } from "#tests/utils/createProjectLinter";

async function lintDocTags(source: string, config = "export default {};\n") {
  const { lint } = await createProjectLinter(config);

  const messages = await lint("src/example.ts", "auaust/doc-tags", source);

  return messages.map(({ line, message }) => {
    return { line, message };
  });
}

describe("docs.docTags", () => {
  test("reports undeclared, repeated, excluded and unmatched tags and implementation blocks", async () => {
    const source = [
      "/**",
      " * @stabel",
      " */",
      "export const a = 1;",
      "/**",
      " * @returns One.",
      " * @returns Two.",
      " * @stable",
      " * @experimental",
      " * @param missing - Absent.",
      " */",
      "export function b(value: string): string {",
      "  return value;",
      "}",
      "export function c(value: string): string;",
      "export function c(value: number): number;",
      "/**",
      " * Implementation.",
      " */",
      "export function c(value: string | number): string | number {",
      "  return value;",
      "}",
      "",
    ].join("\n");

    const messages = await lintDocTags(source);

    expect(messages.map(({ line }) => line)).toStrictEqual([2, 7, 9, 10, 17]);

    expect(messages[0]?.message).toContain("@stabel");
  });

  test("checks tags per overload signature", async () => {
    const source = [
      "/**",
      " * @stable",
      " */",
      "export function d(value: string): string;",
      "/**",
      " * @experimental",
      " */",
      "export function d(value: number): number;",
      "export function d(value: string | number): string | number {",
      "  return value;",
      "}",
      "",
    ].join("\n");

    expect(await lintDocTags(source)).toStrictEqual([]);
  });

  test("finds the block past a line comment before the declaration", async () => {
    const source = [
      "/**",
      " * @param value - Input.",
      " */",
      "// @debt note",
      "export function e(value: string): string {",
      "  return value;",
      "}",
      "",
    ].join("\n");

    expect(await lintDocTags(source)).toStrictEqual([]);
  });

  test("accepts an effect tag naming a configured level and reports one naming none", async () => {
    const config = 'export default { structure: { effects: { levels: ["pure", { name: "logging", purpose: "Write logs." }, "printing", "confined", "observing", "effectful"] } } };\n';

    const tagged = (body: string) => {
      return `/**\n * ${body}\n */\nexport function f(): void {}\n`;
    };

    expect(await lintDocTags(tagged("@effect logging"), config)).toStrictEqual(
      [],
    );

    expect(await lintDocTags(tagged("@observing"), config)).toStrictEqual([]);

    const [
      unknown,
      ...rest
    ] = await lintDocTags(tagged("@effect loud"), config);

    expect(rest).toStrictEqual([]);
    expect(unknown?.message).toContain("@effect");
  });
});
