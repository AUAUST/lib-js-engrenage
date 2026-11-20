import { parse, record, string } from "valibot";

import { object } from "@auaust/toolkit";

import { effectModuleSchema, type EffectModule } from "#batiment/roles/index";
import { engrenage } from "#constants";
import { resolveDataFile } from "#foundation/data/index";
import { readJsonFile } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";

export const effectModulesSection = declareSection({
  async resolve(): Promise<Readonly<Record<string, EffectModule>>> {
    const file = resolveDataFile(`${engrenage}/effects/modules.json`);

    const modules = parse(
      record(string(), effectModuleSchema),
      await readJsonFile(file),
    );

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
  },
});
