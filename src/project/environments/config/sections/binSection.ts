import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import { binOptionsSection } from "#project/environments/config/sections/binOptionsSection";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import type { ConfigContext } from "#project/config/index";

export const binSection = declareSection({
  name: "bin",
  async resolve(_input, config: Resolver<ConfigContext>) {
    const option = await config.resolve(binOptionsSection);

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
