import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { resolveEnvironment } from "#project/config/operations/resolveEnvironment";
import { resolveEnvironmentRoles } from "#project/config/operations/resolveEnvironmentRoles";
import { runtimeSection } from "#project/config/operations/runtimeSection";
import { scriptsOptionsSection } from "#project/config/operations/scriptsOptionsSection";
import type { ConfigContext } from "#project/config/types/ConfigContext";

export const scriptsSection = declareSection({
  name: "scripts",
  async resolve(_input, config: Resolver<ConfigContext>) {
    const { node } = await config.resolve(runtimeSection);
    const option = await config.resolve(scriptsOptionsSection);

    return freeze(
      compose(
        {
          roles: await resolveEnvironmentRoles(config, "scripts", option),
        },
        compose.values(await resolveEnvironment(config, option, "scripts")),
        compose.getters({
          runtime: () => resolveNodeRuntime(node, "runtime.node"),
        }),
      ),
    );
  },
});
