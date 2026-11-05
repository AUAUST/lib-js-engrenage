import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";
import { once } from "@auaust/toolkit/once";

import { declareSection, type Resolver } from "#foundation/options/index";
import { resolveSourceRuntime } from "#project/baseline/index";
import { resolveEnvironment } from "#project/config/operations/resolveEnvironment";
import { resolveEnvironmentRoles } from "#project/config/operations/resolveEnvironmentRoles";
import { sourceOptionsSection } from "#project/config/operations/sourceOptionsSection";
import type { ConfigContext } from "#project/config/types/ConfigContext";

// @debt each environment splits into a declared options section and a derived one under the same name, so a cycle message can show the name twice
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
          roles: await resolveEnvironmentRoles(config, "src", option),
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
