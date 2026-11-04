import { describe, expect, test } from "vitest";

import { resolveBinary } from "#foundation/processes/operations/resolveBinary";

describe("resolveBinary", () => {
  test("resolves a binary declared by an installed dependency", () => {
    expect(resolveBinary(process.cwd(), "prettier", "prettier")).toMatch(
      /prettier[/\\]bin[/\\]prettier\.cjs$/,
    );
  });

  test("fails when the dependency declares no such binary", () => {
    expect(() => resolveBinary(process.cwd(), "typescript", "nope")).toThrow(
      'declares no "nope" binary',
    );
  });
});
