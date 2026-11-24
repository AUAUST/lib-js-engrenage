import { getOwn } from "@auaust/toolkit/object";

import { createEnvironmentTsconfig } from "#project/environments/operations/createEnvironmentTsconfig";
import type { ConfigResolver } from "#project/config/index";
import type {
  ResolvedEnvironmentTsconfig,
  TsconfigKey,
} from "#project/tsconfig/index";

/**
 * The tsconfig of `key`: the `tests.dist` variant's from the tests options, any
 * other from the registration of that name.
 *
 * @throws When no registration named `key` has a preset with a tsconfig.
 */
export async function resolveEnvironmentTsconfig(
  config: ConfigResolver,
  key: TsconfigKey,
): Promise<ResolvedEnvironmentTsconfig> {
  // @debt "tests.dist" is no registration, so it is special-cased here and in testsSection, listTsconfigTargets, syncTsconfigFiles, toTsconfigEnvironment, toTsconfigOptionPath and the extends, include, paths and skipLibCheck producers; a single lookup from tsconfig key to its environment would remove the branches
  if (key === "tests.dist") {
    const tests = await config.resolve("tests.options");

    return createEnvironmentTsconfig(config, key, tests.dist.tsconfig);
  }

  const tsconfig = getOwn(await config.resolve("environments.tsconfig"), key);

  if (tsconfig === undefined) {
    throw new Error(
      `No environment named ${key} is registered on a preset with a tsconfig`,
    );
  }

  return tsconfig;
}
