import { toArray } from "@auaust/toolkit/array";
import { entries, freeze } from "@auaust/toolkit/object";

import { filesIn } from "#foundation/filesystem/index";
import { declareSection } from "#foundation/options/index";
import { generatorsSchema } from "#project/generators/config/schemas/generatorsSchema";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedGenerator } from "#project/generators/types/ResolvedGenerator";

export const generatorsSection = declareSection({
  declaration: generatorsSchema,
  resolve(input, config: ConfigResolver): readonly ResolvedGenerator[] {
    const { scopeDir } = config.context;

    const generators = generatorsSchema.resolve(input, {}, "generators");

    return freeze(
      entries(generators).map(([name, { command, inputs, outputs }]) => {
        return freeze({
          name,
          command,
          dir: scopeDir,
          inputs: filesIn(scopeDir, toArray(inputs)),
          outputs: filesIn(scopeDir, toArray(outputs)),
        });
      }),
    );
  },
});
