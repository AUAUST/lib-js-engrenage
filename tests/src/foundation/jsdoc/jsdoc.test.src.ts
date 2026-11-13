import { describe, expect, test } from "vitest";

import {
  findCommentLines,
  isJsdocComment,
  parseJsdoc,
  printJsdoc,
} from "#foundation/jsdoc/index";

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

  test("finds a tag after text on a line of a multiline block", () => {
    const text = "/**\n * Text. @deprecated\n */";
    const parsed = parseJsdoc(text);

    expect(parsed.description).toBe("Text.");

    expect(
      parsed.tags.map(({ name, text }) => {
        return { name, text };
      }),
    ).toEqual([{ name: "deprecated", text: "" }]);

    expect(parsed.tags.map((tag) => text.slice(...tag.range))).toEqual([
      "@deprecated",
    ]);

    expect(printJsdoc(parsed)).toBe("/**\n * Text.\n *\n * @deprecated\n */");
  });

  test("starts no tag inside inline code, inline tags, words or fences", () => {
    const text = `/**
 * Uses \`a @b\`, {@link X} and a@b.c.
 *
 * \`\`\`ts
 * const x = 1; @y
 * \`\`\`
 */`;

    const parsed = parseJsdoc(text);

    expect(parsed.tags).toEqual([]);

    expect(parsed.description).toBe(
      "Uses `a @b`, {@link X} and a@b.c.\n\n```ts\nconst x = 1; @y\n```",
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

describe("isJsdocComment", () => {
  test("accepts a JSDoc opening and rejects empty or plain block comments", () => {
    expect(isJsdocComment("/** Doc. */")).toBe(true);
    expect(isJsdocComment("/***/")).toBe(true);
    expect(isJsdocComment("/**/")).toBe(false);
    expect(isJsdocComment("/* Plain. */")).toBe(false);
  });
});

describe("findCommentLines", () => {
  test("spans the whole lines of a comment alone on them", () => {
    const text = "a;\n  /**\n   * Doc.\n   */\t\r\nb;";

    expect(findCommentLines(text, [5, 24])).toEqual([3, 26]);
  });

  test("returns nothing when code shares a line with the comment", () => {
    expect(findCommentLines("a; /** Doc. */", [3, 14])).toBeUndefined();
  });
});
