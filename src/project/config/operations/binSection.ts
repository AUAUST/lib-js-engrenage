import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import { binOptionsSection } from "#project/config/operations/binOptionsSection";
import { resolveEnvironment } from "#project/config/operations/resolveEnvironment";
import { noRoles } from "#project/structure/constants";
import type { ConfigContext } from "#project/config/types/ConfigContext";

export const binSection = declareSection({
  name: "bin",
  async resolve(_input, config: Resolver<ConfigContext>) {
    const option = await config.resolve(binOptionsSection);

    return freeze(
      compose(
        {
          roles: noRoles,
          commands: option.commands,
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
