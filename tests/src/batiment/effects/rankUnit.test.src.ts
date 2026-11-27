import { parse } from "valibot";
import { describe, expect, test } from "vitest";

import { defaultEffectLevels } from "#batiment/effects/constants";
import {
  effectLevelsSchema,
  effectRanksSchema,
  rankGlobal,
  rankMember,
  rankUnit,
  resolveEffects,
} from "#batiment/effects/index";
import { resolveDataFile } from "#foundation/data/index";
import { readJsonFile } from "#foundation/filesystem/index";

describe("effect levels", () => {
  test("requires the default levels in order", () => {
    expect(parse(effectLevelsSchema, defaultEffectLevels)).toEqual(
      defaultEffectLevels,
    );

    expect(
      parse(effectLevelsSchema, [
        "pure",
        "printing",
        "confined",
        { name: "custom", purpose: "Custom." },
        "observing",
        "effectful",
      ]),
    ).toContainEqual({ name: "custom", purpose: "Custom." });

    expect(() => {
      return parse(effectLevelsSchema, ["pure", "confined", "effectful"]);
    }).toThrow("observing");

    expect(() => {
      return parse(effectLevelsSchema, [
        "pure",
        "confined",
        "observing",
        "effectful",
      ]);
    }).toThrow("pure, printing, confined");

    expect(() => {
      return parse(effectLevelsSchema, [
        "pure",
        "printing",
        "observing",
        "confined",
        "effectful",
      ]);
    }).toThrow("in that order");
  });

  test("describes each level, custom ones by their purpose", () => {
    const { levels, purposes } = resolveEffects({
      levels: [
        "pure",
        { name: "logging", purpose: "Write logs." },
        "printing",
        "confined",
        "observing",
        "effectful",
      ],
    });

    expect(levels).toEqual([
      "pure",
      "logging",
      "printing",
      "confined",
      "observing",
      "effectful",
    ]);

    expect(purposes.logging).toBe("Write logs.");
    expect(purposes.pure).toContain("arguments only");

    expect(() => {
      return resolveEffects({
        levels: [
          "pure",
          "custom",
          "printing",
          "confined",
          "observing",
          "effectful",
        ],
      });
    }).toThrow("needs a purpose");
  });

  test("checks every stated level once, where effects resolve", () => {
    expect(() => resolveEffects({ fallback: "shaky" })).toThrow("shaky");

    for (const rank of [
      {
        level: "shaky",
        symbols: { read: "pure" },
      },
      {
        level: "pure",
        symbols: { read: "shaky" },
      },
      {
        level: "pure",
        evaluation: "shaky",
      },
    ]) {
      expect(() => {
        return resolveEffects({
          ranks: { custom: rank },
        });
      }).toThrow("shaky");
    }
  });
});

describe("unit ranks", () => {
  test("ranks the shipped table's units and members", async () => {
    const defaults = parse(
      effectRanksSchema,
      await readJsonFile(
        resolveDataFile("@auaust/engrenage/effects/modules.json"),
      ),
    );

    const effects = resolveEffects({ defaults });

    expect(rankMember(effects, "node:fs", ["readFileSync"]).level).toBe(
      "observing",
    );

    expect(rankMember(effects, "node:fs", ["writeFileSync"]).level).toBe(
      "effectful",
    );

    expect(rankMember(effects, "node:path", ["join"]).level).toBe("pure");

    expect(rankMember(effects, "node:console", ["timeEnd"]).level).toBe(
      "printing",
    );

    expect(rankUnit(effects, "unknown-package").level).toBeUndefined();
  });

  test("ranks a member before its unit, whatever source states it", () => {
    const effects = resolveEffects({
      ranks: {
        "custom/*": "pure",
        "custom": {
          level: "effectful",
          symbols: { default: "pure" },
        },
      },
      defaults: {
        custom: {
          level: "pure",
          symbols: { readFileSync: "observing" },
        },
      },
      fallback: "confined",
    });

    expect(rankMember(effects, "custom", ["default"]).level).toBe("pure");

    expect(rankMember(effects, "custom", ["readFileSync"]).level).toBe(
      "observing",
    );

    expect(rankMember(effects, "custom", ["unlisted"]).level).toBe("effectful");
    expect(rankUnit(effects, "custom").level).toBe("effectful");
    expect(rankUnit(effects, "custom/pure").level).toBe("pure");
    expect(rankUnit(effects, "unknown").level).toBe("confined");
  });

  test("ranks an exact key before any glob, and only own symbols", () => {
    const effects = resolveEffects({
      ranks: {
        "lib*": "effectful",
        "library": {
          level: "pure",
          symbols: {},
        },
      },
    });

    expect(rankUnit(effects, "library").level).toBe("pure");
    expect(rankUnit(effects, "libs").level).toBe("effectful");
    expect(rankMember(effects, "library", ["constructor"]).level).toBe("pure");
    expect(rankMember(effects, "library", ["toString"]).level).toBe("pure");
  });

  test("evaluates a unit at the first source stating it, else at the purest level", () => {
    const effects = resolveEffects({
      ranks: {
        stated: { level: "effectful" },
        bare: "effectful",
      },
      defaults: {
        stated: { level: "pure", evaluation: "observing" },
      },
      fallback: "confined",
    });

    expect(rankUnit(effects, "stated")).toMatchObject({
      level: "effectful",
      evaluation: "observing",
    });

    expect(rankUnit(effects, "bare").evaluation).toBe("pure");
    expect(rankUnit(effects, "unknown").evaluation).toBe("confined");
  });

  test("ranks a global by the longest key starting its path, a member path read included", async () => {
    const defaults = parse(
      effectRanksSchema,
      await readJsonFile(
        resolveDataFile("@auaust/engrenage/effects/modules.json"),
      ),
    );

    const effects = resolveEffects({ defaults });

    const globals = [
      {
        "process.env.NODE_ENV": "pure",
      },
      {
        process: { unit: "node:process" },
      },
    ];

    expect(rankGlobal(effects, globals, ["process", "env", "HOME"])).toEqual({
      level: "observing",
      member: "observing",
    });

    expect(
      rankGlobal(effects, globals, ["process", "env", "NODE_ENV"])?.member,
    ).toBe("pure");

    expect(rankGlobal(effects, globals, ["process", "exitCode"])).toEqual({
      level: "effectful",
      member: undefined,
    });

    expect(
      rankGlobal(effects, globals, ["process", "stdout", "write"])?.level,
    ).toBe("printing");

    expect(rankGlobal(effects, globals, ["unknown"])).toBeUndefined();
  });
});
