import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { declareSection } from "#foundation/options/index";
import { resolveSourceRuntime } from "#project/baseline/index";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedSource } from "#project/environments/types/ResolvedSource";

export const sourceSection = declareSection({
  name: "src",
  async resolve(_input, config: ConfigResolver): Promise<ResolvedSource> {
    const option = await config.resolve("src.options");

    const environment = await resolveEnvironment(config, option, "src");

    const runtime = once(() => {
      return option.enabled &&
        (environment.active ||
          option.baseline !== undefined ||
          option.node !== undefined)
        ? resolveSourceRuntime(option)
        : undefined;
    });

    return freeze(
      compose(
        {
          ...environment,
          bundled: option.bundled,
          apis: option.apis,
        },
        compose.getters({
          runtime,
        }),
      ),
    );
  },
});
