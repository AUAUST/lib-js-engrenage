import { describe, expect, test } from "vitest";

import { splitFrontmatter } from "#foundation/markdown/index";

describe("splitFrontmatter", () => {
  test("splits frontmatter with CRLF line endings", () => {
    expect(splitFrontmatter("---\r\na: 1\r\n---\r\nbody")).toEqual({
      kind: "closed",
      source: "---\r\na: 1\r\n---\r\n",
      yaml: "a: 1",
      body: "body",
    });
  });

  test("splits the same content once", () => {
    const content = "---\na: 1\n---\nbody";

    expect(splitFrontmatter(content)).toBe(splitFrontmatter(content));

    expect(splitFrontmatter(`${content}\n`)).toMatchObject({
      body: "body\n",
    });
  });

  test("reports an opening fence left unclosed", () => {
    expect(splitFrontmatter("---\na: 1\n")).toEqual({
      kind: "unclosed",
      body: "---\na: 1\n",
    });
  });

  test("reads a body without frontmatter", () => {
    expect(splitFrontmatter("# Title\n")).toEqual({
      kind: "none",
      body: "# Title\n",
    });
  });
});
