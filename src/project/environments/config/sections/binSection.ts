import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedBin } from "#project/environments/types/ResolvedBin";

export const binSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedBin> {
    const option = await config.resolve("bin.options");

    return freeze(
      compose(
        {
          entries: option.entries,
        },
        compose.values(await resolveEnvironment(config, option, "bin")),
        compose.getters({
          runtime: () => {
            return option.enabled
              ? freeze({ kind: "node" as const, major: option.node })
              : undefined;
          },
        }),
      ),
    );
  },
});
