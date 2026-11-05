import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import {
  distTestsVariant,
  sourceTestsVariant,
} from "#project/config/constants";
import { resolveEnvironment } from "#project/config/operations/resolveEnvironment";
import { resolveEnvironmentRoles } from "#project/config/operations/resolveEnvironmentRoles";
import { resolveEnvironmentTsconfig } from "#project/config/operations/resolveEnvironmentTsconfig";
import { runtimeSection } from "#project/config/operations/runtimeSection";
import { testsOptionsSection } from "#project/config/operations/testsOptionsSection";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { Globs } from "#types/Globs";

export const testsSection = declareSection({
  name: "tests",
  async resolve(_input, config: Resolver<ConfigContext>) {
    const { node } = await config.resolve(runtimeSection);
    const option = await config.resolve(testsOptionsSection);

    function pattern(variant: string): Globs {
      return option.enabled
        ? [`${option.location}${option.suffix}${variant}${option.extension}`]
        : [];
    }

    const patterns = freeze({
      plain: pattern(""),
      source: pattern(sourceTestsVariant),
      dist: pattern(distTestsVariant),
    });

    return freeze(
      compose(
        {
          roles: await resolveEnvironmentRoles(config, "tests", option),
          layout: option.enabled ? option.layout : "roots",
          patterns,
          files: [...patterns.plain, ...patterns.source, ...patterns.dist],
          fixtures: option.fixtures,
          coverageDir: option.coverageDir,
          dist: freeze({
            tsconfig: await resolveEnvironmentTsconfig(config, "tests.dist"),
          }),
        },
        compose.values(await resolveEnvironment(config, option, "tests")),
        compose.getters({
          runtime: () => resolveNodeRuntime(node, "runtime.node"),
        }),
      ),
    );
  },
});
