import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { runtimeSection } from "#project/environments/config/sections/runtimeSection";
import { scriptsOptionsSection } from "#project/environments/config/sections/scriptsOptionsSection";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import type { ConfigContext } from "#project/config/index";

export const scriptsSection = declareSection({
  name: "scripts",
  async resolve(_input, config: Resolver<ConfigContext>) {
    const { node } = await config.resolve(runtimeSection);

    const option = await config.resolve(scriptsOptionsSection);

    return freeze(
      compose(
        {},
        compose.values(await resolveEnvironment(config, option, "scripts")),
        compose.getters({
          runtime: () => resolveNodeRuntime(node, "runtime.node"),
        }),
      ),
    );
  },
});
