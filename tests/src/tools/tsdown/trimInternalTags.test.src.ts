import { SourceMap } from "node:module";

import { describe, expect, test } from "vitest";

import { trimInternalTags } from "#tools/tsdown/utils/trimInternalTags";

function trim(code: string) {
  const result = trimInternalTags(code, new Set(["secret"]));

  if (result === undefined) {
    throw new Error("Expected the chunk to change");
  }

  return result;
}

const chunk = [
  "/**",
  " * Reads a value.",
  " *",
  " * @secret",
  " * @stable",
  " */",
  "declare function read(): string;",
  "/**",
  " * @secret only here",
  " */",
  "declare const hidden: number;",
  "export { hidden, read };",
  "",
].join("\n");

describe("trimInternalTags", () => {
  test("removes internal tags and keeps public ones in the same block", () => {
    expect(trim(chunk).code).toBe(
      [
        "/**",
        " * Reads a value.",
        " *",
        " * @stable",
        " */",
        "declare function read(): string;",
        "declare const hidden: number;",
        "export { hidden, read };",
        "",
      ].join("\n"),
    );
  });

  test("keeps a block sharing its line with code on that line", () => {
    expect(
      trim("interface Value { /** Kept. @secret @stable */ read: string }\n")
        .code,
    ).toBe("interface Value { /** Kept. @stable */ read: string }\n");
  });

  test("maps a declaration below removed lines to its source line", () => {
    const { code, map } = trim(chunk);

    const line = code.split("\n").indexOf("declare const hidden: number;");

    const entry = new SourceMap({
      version: 3,
      file: "index.d.mts",
      sourceRoot: "",
      sources: ["index.d.mts"],
      sourcesContent: [chunk],
      names: [],
      mappings: map.mappings,
    }).findEntry(line, 0);

    expect("originalLine" in entry && entry.originalLine).toBe(
      chunk.split("\n").indexOf("declare const hidden: number;"),
    );
  });
});
