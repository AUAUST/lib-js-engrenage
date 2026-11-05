import { describe, expect, test } from "vitest";

import { resolveBinary } from "#foundation/processes/operations/resolveBinary";

describe("resolveBinary", () => {
  test("resolves a binary declared by an installed dependency", async () => {
    expect(await resolveBinary(process.cwd(), "prettier", "prettier")).toMatch(
      /prettier[/\\]bin[/\\]prettier\.cjs$/,
    );
  });

  test("fails when the dependency declares no such binary", async () => {
    await expect(
      resolveBinary(process.cwd(), "typescript", "nope"),
    ).rejects.toThrow('declares no "nope" binary');
  });
});
