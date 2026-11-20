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

  test("reads past a frontmatter line that only starts like a fence", () => {
    expect(
      splitFrontmatter("---\na: 1\n----\nb: 2\n---\nbody\n\n---\n"),
    ).toEqual({
      kind: "closed",
      source: "---\na: 1\n----\nb: 2\n---\n",
      yaml: "a: 1\n----\nb: 2",
      body: "body\n\n---\n",
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
