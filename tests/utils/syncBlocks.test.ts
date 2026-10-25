import { markdownBlocks } from "#agents/constants";
import { syncBlocks } from "@auaust/engrenage";
import { describe, expect, test } from "vitest";

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
      "<!-- @registry ./*.md -->",
      "<!-- @unknown ./other.md -->",
      "<!-- @end -->",
      "",
    ].join("\n");

    expect(
      syncBlocks(content, markdownBlocks, {
        registry(glob: string) {
          return `registry ${glob}`;
        },
      }),
    ).toBe(
      [
        "<!-- @registry ./*.md -->",
        "",
        "registry ./*.md",
        "",
        "<!-- @end -->",
        "",
      ].join("\n"),
    );
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
