import { describe, expect, test } from "vitest";

import { formatBlockMarker } from "#foundation/blocks/utils/formatBlockMarker";
import { listBlockMarkers } from "#foundation/blocks/utils/listBlockMarkers";
import { markdownBlocks } from "#tools/agents/constants";

describe("block markers", () => {
  test("formats a marker with its arguments", () => {
    expect(formatBlockMarker(markdownBlocks, "reference", ["a"])).toBe(
      "<!-- @reference a -->",
    );
  });

  test("lists each marker of two blocks with its line", () => {
    const content = [
      "# Title",
      "<!-- @reference a -->",
      "<!-- @end -->",
      "<!-- @reference b -->",
      "text",
      "<!-- @end -->",
    ].join("\n");

    expect(
      listBlockMarkers(content, markdownBlocks).map(
        ({ directive, args, line }) => {
          return {
            directive,
            args,
            line,
          };
        },
      ),
    ).toEqual([
      {
        directive: "reference",
        args: ["a"],
        line: 2,
      },
      {
        directive: "end",
        args: [],
        line: 3,
      },
      {
        directive: "reference",
        args: ["b"],
        line: 4,
      },
      {
        directive: "end",
        args: [],
        line: 6,
      },
    ]);
  });
});
