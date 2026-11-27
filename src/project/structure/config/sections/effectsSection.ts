import { parse } from "valibot";

import { object } from "@auaust/toolkit";

import {
  effectRanksSchema,
  resolveEffects,
  type ResolvedEffects,
} from "#batiment/effects/index";
import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";
import { readJsonFile } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import type { ConfigResolver } from "#project/config/index";

async function readShippedRanks() {
  const file = resolveDataFile(`${engrenage}/effects/modules.json`);
  const modules = parse(effectRanksSchema, await readJsonFile(file));

  return object.record(
    object.entries(modules).flatMap(([specifier, entry]) => {
      return specifier.startsWith("node:")
        ? ([
            [specifier, entry],
            [specifier.slice(5), entry],
          ] as const)
        : ([[specifier, entry]] as const);
    }),
  );
}

export const effectsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedEffects> {
    const [{ effects }, defaults] = await Promise.all([
      config.resolve("structure.options"),
      readShippedRanks(),
    ]);

    return resolveEffects({
      levels: effects?.levels,
      ranks: effects?.modules,
      defaults,
      fallback: effects?.fallback,
    });
  },
});
