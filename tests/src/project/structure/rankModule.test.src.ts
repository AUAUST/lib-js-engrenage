import { parse } from "valibot";
import { describe, expect, test } from "vitest";

import { resolveDataFile } from "#foundation/data/index";
import { readJsonFile } from "#foundation/filesystem/index";
import { effectLevelsSchema } from "#project/structure/config/schemas/effectLevelsSchema";
import { effectModulesSchema } from "#project/structure/config/schemas/effectModulesSchema";
import { defaultEffectLevels } from "#project/structure/constants";
import { rankModule } from "#project/structure/utils/rankModule";
import type { ResolvedEffects } from "#project/structure/types/ResolvedEffects";

describe("module effect levels", () => {
  test("requires the four default levels in order", () => {
    expect(parse(effectLevelsSchema, defaultEffectLevels)).toEqual(
      defaultEffectLevels,
    );

    expect(
      parse(effectLevelsSchema, [
        "pure",
        "confined",
        "custom",
        "observing",
        "effectful",
      ]),
    ).toContain("custom");

    expect(() => {
      return parse(effectLevelsSchema, ["pure", "confined", "effectful"]);
    }).toThrow("observing");

    expect(() => {
      return parse(effectLevelsSchema, [
        "pure",
        "observing",
        "confined",
        "effectful",
      ]);
    }).toThrow("in that order");
  });

  test("uses the shipped defaults and symbol overrides", async () => {
    const modules = parse(
      effectModulesSchema,
      await readJsonFile(
        resolveDataFile("@auaust/engrenage/effects/modules.json"),
      ),
    );

    const effects: ResolvedEffects = {
      levels: defaultEffectLevels,
      modules: [modules],
      fallback: undefined,
    };

    expect(rankModule(effects, "node:fs", "readFileSync")).toBe("observing");
    expect(rankModule(effects, "node:fs", "writeFileSync")).toBe("effectful");
    expect(rankModule(effects, "node:fs")).toBe("effectful");
    expect(rankModule(effects, "node:path", "join")).toBe("pure");
    expect(rankModule(effects, "unknown-package", "read")).toBeUndefined();
  });

  test("supports structured resolver entries, module patterns and fallback", () => {
    const entry = {
      default: "effectful",
      symbols: { default: "pure", readFileSync: "observing" },
    };

    const effects: ResolvedEffects = {
      levels: defaultEffectLevels,
      modules: [
        (specifier) => {
          return specifier === "custom" ? entry : undefined;
        },
        { "custom/*": "pure" },
      ],
      fallback: "confined",
    };

    expect(rankModule(effects, "custom", "default")).toBe("pure");
    expect(rankModule(effects, "custom", "readFileSync")).toBe("observing");
    expect(rankModule(effects, "custom", "unlisted")).toBe("effectful");
    expect(rankModule(effects, "custom")).toBe("effectful");
    expect(rankModule(effects, "custom/pure")).toBe("pure");
    expect(rankModule(effects, "unknown")).toBe("confined");

    expect(() => {
      return rankModule(
        {
          ...effects,
          modules: [
            () => {
              return {
                default: "pure",
                symbols: { invalid: "missing" },
              };
            },
          ],
        },
        "custom",
        "default",
      );
    }).toThrow("missing");
  });
});
