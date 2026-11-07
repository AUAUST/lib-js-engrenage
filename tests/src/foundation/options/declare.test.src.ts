import { toJsonSchema } from "@valibot/to-json-schema";
import { boolean, maxValue, number, pipe, safeParse } from "valibot";
import { describe, expect, test } from "vitest";

import { declare } from "#foundation/options/config/declarers/declare";
import { declareObject } from "#foundation/options/config/declarers/declareObject";
import { gitSchema } from "#tools/git/config/schemas/gitSchema";

describe("declare", () => {
  test("fills defaults, rejects invalid input and describes the default", () => {
    const context = undefined;

    expect(gitSchema.resolve(undefined, context, "git").gitignore).toEqual({
      file: ".gitignore",
      configured: false,
    });

    expect(gitSchema.resolve({ gitignore: "x" }, context, "git")).toEqual({
      gitignore: { file: "x", configured: true },
      local: { gitignore: true, files: undefined },
    });

    expect(safeParse(gitSchema.schema, { gitignore: 1 }).success).toBe(false);
    expect(safeParse(gitSchema.schema, { other: 1 }).success).toBe(false);

    expect(
      JSON.stringify(toJsonSchema(gitSchema.schema, { errorMode: "ignore" })),
    ).toContain("@default `.gitignore`");
  });

  test("computes a default from the context and explains it", () => {
    const section = declareObject(
      {
        typed: declare(boolean(), {
          description: "Typed.",
          optional: {
            explain: "`other.flag`",
            compute(context: { flag: boolean }) {
              return context.flag;
            },
          },
        }),
      },
      {
        optional: true,
        disable: {
          value: { typed: false },
        },
      },
    );

    expect(section.resolve(undefined, { flag: true }, "s")).toMatchObject({
      typed: true,
      enabled: true,
    });

    expect(section.resolve({ typed: false }, { flag: true }, "s").typed).toBe(
      false,
    );

    expect(section.resolve(false, { flag: true }, "s")).toEqual({
      typed: false,
      enabled: false,
    });

    expect(
      JSON.stringify(toJsonSchema(section.schema, { errorMode: "ignore" })),
    ).toContain("Typed.\\n@default `other.flag`");
  });

  test("validates with the schema narrowed by the context", () => {
    const limited = declare(number(), {
      schema: (context: { max: number }) =>
        pipe(number(), maxValue(context.max)),
      optional: { value: 1 },
    });

    expect(limited.resolve(5, { max: 9 }, "n")).toBe(5);
    expect(() => limited.resolve(5, { max: 3 }, "n")).toThrow("Invalid n");
  });
});
