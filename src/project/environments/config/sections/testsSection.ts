import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import { declareSection } from "#foundation/options/index";
import { resolveNodeRuntime } from "#project/baseline/index";
import { resolveEnvironment } from "#project/environments/operations/resolveEnvironment";
import { resolveEnvironmentTsconfig } from "#project/environments/operations/resolveEnvironmentTsconfig";
import { composeTestsPatterns } from "#project/environments/utils/composeTestsPatterns";
import type { ConfigResolver } from "#project/config/index";
import type { ResolvedTests } from "#project/environments/types/ResolvedTests";

export const testsSection = declareSection({
  async resolve(_input, config: ConfigResolver): Promise<ResolvedTests> {
    const { node } = await config.resolve("runtime");

    const option = await config.resolve("tests.options");

    const patterns = composeTestsPatterns(option);

    return freeze(
      compose(
        {
          mirror: option.enabled && option.mirror,
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
