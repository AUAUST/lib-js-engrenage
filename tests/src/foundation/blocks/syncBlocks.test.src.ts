import { describe, expect, test } from "vitest";

import { syncBlocks } from "#foundation/blocks/utils/syncBlocks";

// @debt this test is source-only because the generated tsconfig paths resolve `@auaust/engrenage/agents/constants` to `agents/*/index.ts` instead of `agents/constants.ts`; it could test the built package through the public entry
import { markdownBlocks } from "#tools/agents/constants";

const fillers = {
  reference(reference: string) {
    return `## ${reference}\n`;
  },
};

describe("syncBlocks", () => {
  test("fills each block up to the next marker, ignoring inline mentions", async () => {
    const content = [
      "# Local title",
      "<!-- @reference ./first.md -->",
      "stale text",
      "<!-- @reference ./second.md -->",
      "<!-- @end -->",
      "Mentions `<!-- @end -->` inline.",
      "",
    ].join("\n");

    expect(await syncBlocks(content, markdownBlocks, fillers)).toBe(
      [
        "# Local title",
        "<!-- @reference ./first.md -->",
        "",
        "## ./first.md",
        "",
        "<!-- @reference ./second.md -->",
        "",
        "## ./second.md",
        "",
        "<!-- @end -->",
        "Mentions `<!-- @end -->` inline.",
        "",
      ].join("\n"),
    );
  });

  test("uses the filler of each directive", async () => {
    const content = ["<!-- @list ./*.md -->", "<!-- @end -->", ""].join("\n");

    expect(
      await syncBlocks(content, markdownBlocks, {
        list(glob: string) {
          return `list ${glob}`;
        },
      }),
    ).toBe(
      [
        "<!-- @list ./*.md -->",
        "",
        "list ./*.md",
        "",
        "<!-- @end -->",
        "",
      ].join("\n"),
    );
  });

  test("rejects a misspelled directive and an end marker that closes no block", async () => {
    await expect(async () => {
      return await syncBlocks(
        "<!-- @refrence ./first.md -->\n<!-- @end -->\n",
        markdownBlocks,
        fillers,
      );
    }).rejects.toThrow('Unknown directive in "<!-- @refrence ./first.md -->"');

    await expect(async () => {
      return await syncBlocks(
        "<!-- @reference ./first.md -->\n<!-- @end -->\n<!-- @end -->\n",
        markdownBlocks,
        fillers,
      );
    }).rejects.toThrow('"<!-- @end -->" closes no block');
  });

  test("passes every argument of the marker to its filler", async () => {
    expect(
      await syncBlocks(
        "<!-- @list ./*.md all -->\n<!-- @end -->\n",
        markdownBlocks,
        {
          list(glob: string, mode: string) {
            return `${mode} ${glob}`;
          },
        },
      ),
    ).toBe("<!-- @list ./*.md all -->\n\nall ./*.md\n\n<!-- @end -->\n");
  });

  test("keeps a block whose filler returns undefined", async () => {
    const content = [
      "<!-- @reference ./kept.md -->",
      "local text",
      "<!-- @reference ./first.md -->",
      "<!-- @end -->",
      "",
    ].join("\n");

    expect(
      await syncBlocks(content, markdownBlocks, {
        reference(reference: string) {
          return reference === "./kept.md" ? undefined : `## ${reference}`;
        },
      }),
    ).toBe(
      [
        "<!-- @reference ./kept.md -->",
        "local text",
        "<!-- @reference ./first.md -->",
        "",
        "## ./first.md",
        "",
        "<!-- @end -->",
        "",
      ].join("\n"),
    );
  });

  test("rejects a last block without an end marker", async () => {
    await expect(async () => {
      return await syncBlocks(
        "<!-- @reference ./first.md -->\nlocal text\n",
        markdownBlocks,
        fillers,
      );
    }).rejects.toThrow('Missing "@end" marker');
  });
});
