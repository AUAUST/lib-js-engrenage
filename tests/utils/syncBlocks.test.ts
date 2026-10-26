import { describe, expect, test } from "vitest";

import { syncBlocks } from "@auaust/engrenage";

import { markdownBlocks } from "#agents/constants";

const fillers = {
  reference(reference: string) {
    return `## ${reference}\n`;
  },
};

describe("syncBlocks", () => {
  test("fills each block up to the next marker, ignoring inline mentions", () => {
    const content = [
      "# Local title",
      "<!-- @reference ./first.md -->",
      "stale text",
      "<!-- @reference ./second.md -->",
      "<!-- @end -->",
      "Mentions `<!-- @end -->` inline.",
      "",
    ].join("\n");

    expect(syncBlocks(content, markdownBlocks, fillers)).toBe(
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

  test("uses the filler of each directive and does not treat unknown ones as markers", () => {
    const content = [
      "<!-- @list ./*.md -->",
      "<!-- @unknown ./other.md -->",
      "<!-- @end -->",
      "",
    ].join("\n");

    expect(
      syncBlocks(content, markdownBlocks, {
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

  test("passes every argument of the marker to its filler", () => {
    expect(
      syncBlocks("<!-- @list ./*.md all -->\n<!-- @end -->\n", markdownBlocks, {
        list(glob: string, mode: string) {
          return `${mode} ${glob}`;
        },
      }),
    ).toBe("<!-- @list ./*.md all -->\n\nall ./*.md\n\n<!-- @end -->\n");
  });

  test("rejects a last block without an end marker", () => {
    expect(() => {
      return syncBlocks(
        "<!-- @reference ./first.md -->\nlocal text\n",
        markdownBlocks,
        fillers,
      );
    }).toThrow('Missing "@end" marker');
  });
});
