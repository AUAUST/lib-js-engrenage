import { resolveReference } from "@auaust/engrenage";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const root = join(import.meta.dirname, "../..");

const from = join(root, "AGENTS.md");

describe("resolveReference", () => {
  test("resolves package specifiers and paths relative to the referencing file", () => {
    expect(
      resolveReference("@auaust/engrenage/agents/sections/precedence.md", from),
    ).toBe(join(root, "config/agents/sections/precedence.md"));
    expect(resolveReference("./package.json", from)).toBe(
      join(root, "package.json"),
    );
  });

  test("rejects an unknown reference", () => {
    expect(() => {
      return resolveReference("./missing.md", from);
    }).toThrow();
  });
});
