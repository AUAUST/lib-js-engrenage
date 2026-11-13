import { describe, expect, test } from "vitest";

import { parseJsdoc, printJsdoc } from "#foundation/jsdoc/index";

const block = `  /**
   * Parses a value.
   *
   * \`\`\`ts
   * @notATag inside the fence
   * \`\`\`
   *
   * @param value - the value
   *   to parse
   * @returns the parsed value
   */`;

describe("parseJsdoc", () => {
  test("splits the description from the tags, keeping fences intact", () => {
    const parsed = parseJsdoc(block);

    expect(parsed.indent).toBe("  ");
    expect(parsed.range).toEqual([2, block.length]);

    expect(parsed.description).toBe(
      "Parses a value.\n\n```ts\n@notATag inside the fence\n```",
    );

    expect(
      parsed.tags.map(({ name, text }) => {
        return { name, text };
      }),
    ).toEqual([
      { name: "param", text: "value - the value\n  to parse" },
      { name: "returns", text: "the parsed value" },
    ]);

    expect(parsed.tags.map((tag) => block.slice(...tag.range))).toEqual([
      "@param value - the value\n   *   to parse",
      "@returns the parsed value",
    ]);
  });

  test("shifts every range by the offset", () => {
    const parsed = parseJsdoc(block);
    const shifted = parseJsdoc(block, 100);

    expect(shifted.range).toEqual([
      parsed.range[0] + 100,
      parsed.range[1] + 100,
    ]);

    expect(shifted.tags.map((tag) => tag.range)).toEqual(
      parsed.tags.map(({ range: [start, end] }) => {
        return [start + 100, end + 100];
      }),
    );
  });

  test("rejects text other than one JSDoc comment", () => {
    expect(() => parseJsdoc("/** a */ /** b */")).toThrow();
    expect(() => parseJsdoc("/* a */")).toThrow();
  });
});

describe("printJsdoc", () => {
  test("returns a canonical block unchanged", () => {
    expect(printJsdoc(parseJsdoc(block))).toBe(block);
  });

  test("splits a single-line block into the canonical multiline form", () => {
    const text = "/** Text. @tag value */";
    const parsed = parseJsdoc(text);

    expect(printJsdoc(parsed)).toBe("/**\n * Text.\n *\n * @tag value\n */");

    expect(
      parsed.tags.map((tag) => {
        return text.slice(...tag.range);
      }),
    ).toEqual(["@tag value"]);
  });
});
