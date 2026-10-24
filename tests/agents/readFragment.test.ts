import { readFragment } from "@auaust/engrenage/agents";
import { describe, expect, test } from "vitest";

describe("readFragment", () => {
  test("reads a shipped fragment through the package exports", () => {
    expect(readFragment("sections/decision-protocol")).toMatch(
      /^## Decision protocol/,
    );
  });

  test("rejects an unknown fragment", () => {
    expect(() => {
      return readFragment("sections/missing");
    }).toThrow();
  });
});
