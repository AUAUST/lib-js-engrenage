import { readCompilerOptions } from "@auaust/engrenage/typescript";
import { describe, expect, test } from "vitest";

describe("readCompilerOptions", () => {
  test("fails on an unreadable tsconfig", () => {
    expect(() => {
      return readCompilerOptions(
        new URL("../fixtures/tsconfig/missing.json", import.meta.url),
      );
    }).toThrow("missing.json");
  });
});
