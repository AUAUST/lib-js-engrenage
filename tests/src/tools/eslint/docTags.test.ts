import { describe, expect, test } from "vitest";

import { createProjectLinter } from "#tests/utils/createProjectLinter";

async function lintDocTags(source: string) {
  const { lint } = await createProjectLinter("export default {};\n");

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
});
