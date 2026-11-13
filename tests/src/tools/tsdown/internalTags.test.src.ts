import { SourceMap } from "node:module";

import { describe, expect, test } from "vitest";

import { isString } from "@auaust/toolkit/isString";

import { createInternalTagsPlugins } from "#tools/tsdown/plugins/createInternalTagsPlugins";

function render(source: string) {
  const [plugin] = createInternalTagsPlugins("internal-tags", ["secret"]);
  const hook = plugin?.renderChunk;
  const handler = hook == null || !("handler" in hook) ? hook : hook.handler;

  if (handler == null) {
    throw new Error("Expected a renderChunk hook");
  }

  const result = handler.call(
    undefined as never,
    source,
    { fileName: "index.d.mts" } as never,
    undefined as never,
    undefined as never,
  );

  if (result == null || isString(result) || !("map" in result)) {
    throw new Error("Expected a transformed chunk with its map");
  }

  const { code, map } = result;

  if (!isString(code) || map == null || isString(map)) {
    throw new Error("Expected transformed code with a source map object");
  }

  return { code, map };
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

describe("internal-tags", () => {
  test("removes internal tags and keeps public ones in the same block", () => {
    const { code } = render(chunk);

    expect(code).toBe(
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

  test("maps a declaration below removed lines to its source line", () => {
    const { code, map } = render(chunk);

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
