import { markdownBlocks } from "#agents/constants/markdownBlocks";
import { syncBlocks } from "@auaust/engrenage";
import { describe, expect, test } from "vitest";

function fill(reference: string) {
  return `## ${reference}\n`;
}

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

    expect(syncBlocks(content, markdownBlocks, fill)).toBe(
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

  test("rejects a last block without an end marker", () => {
    expect(() => {
      return syncBlocks(
        "<!-- @reference ./first.md -->\nlocal text\n",
        markdownBlocks,
        fill,
      );
    }).toThrow('Missing "@end" marker');
  });
});
