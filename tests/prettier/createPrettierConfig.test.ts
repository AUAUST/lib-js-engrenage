import standardConfig, {
  createPrettierConfig,
  type Config,
} from "@auaust/engrenage/prettier";
import { defaultOptions } from "@auaust/engrenage/prettier/constants";
import { format } from "prettier";
import { describe, expect, expectTypeOf, test } from "vitest";

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

    expectTypeOf(config).toEqualTypeOf<Config>();
    expect(config).toEqual({
      ...standardConfig,
      printWidth: 100,
    });
  });

  test("exposes the default options as the shareable default config", () => {
    expect(standardConfig).toBe(defaultOptions);
    expect(createPrettierConfig()).toEqual(defaultOptions);
  });
});
