import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { declareSection, type Resolver } from "#foundation/options/index";
import { resolveSourceRuntime } from "#project/baseline/index";
import { sourceOptionsSection } from "#project/environments/config/sections/sourceOptionsSection";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import type { ConfigContext } from "#project/config/index";

export const sourceSection = declareSection({
  name: "src",
  async resolve(_input, config: Resolver<ConfigContext>) {
    const option = await config.resolve(sourceOptionsSection);

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
