import { flattenDiagnosticMessageText } from "typescript";
import { describe, expect, test } from "vitest";

import { getFixture } from "#tests/utils/getFixture";
import { createLibraryCompiler } from "#typescript/operations/createLibraryCompiler";

const { compile } = createLibraryCompiler(
  getFixture("typescript/compiler/libs"),
);

function compileLibraries(
  library: readonly string[],
  trusted: readonly string[],
) {
  const diagnostic = compile({
    lib: library,
    trusted,
    sources: new Map([["index.d.ts", ""]]),
    entry: "index.d.ts",
  });

  return diagnostic === undefined
    ? undefined
    : flattenDiagnosticMessageText(diagnostic.messageText, "\n");
}

describe("createLibraryCompiler", () => {
  test("fails on a lib name that does not exist", () => {
    expect(compileLibraries(["base", "nonexistent"], ["base"])).toContain(
      "lib.nonexistent.d.ts' not found",
    );
  });

  test("fails on an untrusted lib that conflicts with a trusted one", () => {
    expect(compileLibraries(["base"], ["base"])).toBeUndefined();

    expect(compileLibraries(["base", "conflict"], ["base"])).toContain(
      "Subsequent property declarations must have the same type",
    );
  });
});
