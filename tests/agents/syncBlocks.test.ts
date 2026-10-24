import { syncBlocks } from "@auaust/engrenage/agents";
import { describe, expect, test } from "vitest";

function readFragment(id: string) {
  return `## ${id}\n`;
}

describe("syncBlocks", () => {
  test("replaces only the content between markers", () => {
    const content = [
      "# Local title",
      "<!-- engrenage:sections/shared -->",
      "stale text",
      "<!-- /engrenage:sections/shared -->",
      "## Local section",
      "",
    ].join("\n");

    expect(syncBlocks(content, readFragment)).toBe(
      [
        "# Local title",
        "<!-- engrenage:sections/shared -->",
        "",
        "## sections/shared",
        "",
        "<!-- /engrenage:sections/shared -->",
        "## Local section",
        "",
      ].join("\n"),
    );
  });

  test("rejects a block without its closing marker", () => {
    expect(() => {
      return syncBlocks("<!-- engrenage:sections/shared -->\n", readFragment);
    }).toThrow("Missing closing marker");
  });
});
