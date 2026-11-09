import { parse, record, string } from "valibot";

import { entries, record as toRecord } from "@auaust/toolkit/object";

import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";
import { readJsonFile } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { effectModuleSchema } from "#project/structure/config/schemas/effectModuleSchema";
import type { EffectModule } from "#project/structure/types/EffectModule";

export const effectModulesSection = declareSection({
  async resolve(): Promise<Readonly<Record<string, EffectModule>>> {
    const file = resolveDataFile(`${engrenage}/effects/modules.json`);

    const modules = parse(
      record(string(), effectModuleSchema),
      await readJsonFile(file),
    );

    return toRecord(
      entries(modules).flatMap(([specifier, entry]) => {
        return specifier.startsWith("node:")
          ? ([
              [specifier, entry],
              [specifier.slice(5), entry],
            ] as const)
          : ([[specifier, entry]] as const);
      }),
    );
  },
});
