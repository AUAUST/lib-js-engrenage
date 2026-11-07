import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection, type Resolver } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { runtimeSection } from "#project/environments/config/sections/runtimeSection";
import { testsOptionsSection } from "#project/environments/config/sections/testsOptionsSection";
import {
  distTestsVariant,
  sourceTestsVariant,
} from "#project/environments/constants";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
import type { ConfigContext } from "#project/config/index";
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
