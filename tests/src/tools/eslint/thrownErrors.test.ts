import { describe, expect, test } from "vitest";

import { createProjectLinter } from "#tests/utils/createProjectLinter";

async function lintThrownErrors(source: string) {
  const { lint } = await createProjectLinter("export default {};\n");

  const messages = await lint("src/example.ts", "auaust/thrown-errors", source);

  return messages.map(({ line }) => line);
}

describe("docs.thrownErrors", () => {
  test("reports blocks stating a thrown error without a @throws tag", async () => {
    const source = [
      "/**",
      " * Parses the value; raises on invalid input.",
      " */",
      "export function a(value: string): string {",
      "  return value;",
      "}",
      "/**",
      " * Loads the file.",
      " *",
      " * @returns A promise rejecting with a `ReadError`.",
      " */",
      "export function b(): void {}",
      "",
    ].join("\n");

    expect(await lintThrownErrors(source)).toStrictEqual([1, 7]);
  });

  test("skips blocks holding a @throws tag or naming no thrown error", async () => {
    const source = [
      "/**",
      " * Parses the value; throws an error on invalid input.",
      " *",
      " * @throws {TypeError} The value is invalid.",
      " */",
      "export function a(value: string): string {",
      "  return value;",
      "}",
      "/**",
      " * Rejects empty values, logging an error.",
      " */",
      "export function b(): void {}",
      "",
    ].join("\n");

    expect(await lintThrownErrors(source)).toStrictEqual([]);
  });
});
