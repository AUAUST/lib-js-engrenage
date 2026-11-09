import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedScripts } from "#project/environments/types/ResolvedScripts";

export const scriptsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedScripts> {
    const { node } = await config.resolve("runtime");

    const option = await config.resolve("scripts.options");

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
