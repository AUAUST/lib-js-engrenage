import { parse } from "valibot";

import { object } from "@auaust/toolkit";

import {
  effectRanksSchema,
  resolveEffects,
  type EffectRanks,
  type ResolvedEffects,
} from "#batiment/effects/index";
import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";
import { readJsonFile } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/index";

function withBareTwins(ranks: EffectRanks): EffectRanks {
  return object.record([
    ...object.entries(ranks).flatMap(([specifier, entry]) => {
      return specifier.startsWith("node:")
        ? [[specifier.slice(5), entry] as const]
        : [];
    }),
    ...object.entries(ranks),
  ]);
}

async function readShippedRanks() {
  const file = resolveDataFile(`${engrenage}/effects/modules.json`);

  return withBareTwins(parse(effectRanksSchema, await readJsonFile(file)));
}

export const effectsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedEffects> {
    const [{ effects }, defaults] = await Promise.all([
      config.resolve("structure.options"),
      readShippedRanks(),
    ]);

    return resolveEffects({
      levels: effects?.levels,
      ranks: effects?.modules === undefined
        ? undefined
        : withBareTwins(effects.modules),
      defaults,
      fallback: effects?.fallback,
    });
  },
});
