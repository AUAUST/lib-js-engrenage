import standardConfig, {
  createPrettierConfig,
  prettierOptions,
} from "@auaust/engrenage/prettier";
import { format } from "prettier";
import { describe, expect, test } from "vitest";

describe("createPrettierConfig", () => {
  test("formats with the shared standard", async () => {
    const output = await format("const value = {a: 'b', c: [1,2]}", {
      ...standardConfig,
      parser: "typescript",
    });

    expect(output).toBe('const value = { a: "b", c: [1, 2] };\n');
  });

  test("lets a project override individual options", () => {
    const config = createPrettierConfig({
      printWidth: 100,
    });

    expect(config).toEqual({
      ...prettierOptions,
      printWidth: 100,
    });
  });

  test("exposes the standard as the shareable default config", () => {
    expect(standardConfig).toEqual(createPrettierConfig());
  });
});
