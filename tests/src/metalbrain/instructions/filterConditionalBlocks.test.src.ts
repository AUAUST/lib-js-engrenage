import { expect, test } from "vitest";

import { filterConditionalBlocks } from "#metalbrain/instructions/utils/filterConditionalBlocks";

const body = [
  "before",
  "<!-- @extension a -->",
  "gated",
  "<!-- @end -->",
  "after",
].join("\n");

function conditions(extensions: string[], files: string[] = []) {
  return {
    extensions: new Set(extensions),
    exists: (file: string) => Promise.resolve(files.includes(file)),
  };
}

test("keeps an active extension's block without its markers", async () => {
  await expect(filterConditionalBlocks(body, conditions(["a"]))).resolves.toBe(
    "before\ngated\nafter",
  );
});

test("drops an inactive extension's block", async () => {
  await expect(filterConditionalBlocks(body, conditions([]))).resolves.toBe(
    "before\nafter",
  );
});

test("keeps a file block only when the file exists", async () => {
  const gated = "<!-- @file x/y.md -->\nshown\n<!-- @end -->";

  await expect(
    filterConditionalBlocks(gated, conditions([], ["x/y.md"])),
  ).resolves.toBe("shown");

  await expect(filterConditionalBlocks(gated, conditions([]))).resolves.toBe(
    "",
  );
});

test("joins the list the formatter split around a marker", async () => {
  const list = "- a\n\n<!-- @extension b -->\n\n- b\n\n<!-- @end -->\n\n- c";

  await expect(filterConditionalBlocks(list, conditions(["b"]))).resolves.toBe(
    "- a\n- b\n- c",
  );

  await expect(filterConditionalBlocks(list, conditions([]))).resolves.toBe(
    "- a\n- c",
  );
});

test("throws on a block without its end marker", async () => {
  await expect(
    filterConditionalBlocks("<!-- @extension a -->\ngated", conditions([])),
  ).rejects.toThrow("@extension a has no <!-- @end -->");
});
