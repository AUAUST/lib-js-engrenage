import { boolean, custom, is, object } from "valibot";

import { compose } from "@auaust/toolkit/composer";
import { freeze } from "@auaust/toolkit/object";

import {
  locateFile,
  type ConfigContext,
  type ConfigResolver,
} from "#project/config/index";
import {
  resolveTsconfig,
  type ResolvedEnvironmentTsconfig,
  type ResolvedEnvironmentTsconfigOption,
  type TsconfigKey,
} from "#project/tsconfig/index";
import type { Resolver } from "#foundation/options/index";
import type { File } from "#types/File";

// @debt the check covers `enabled` only, so the rest of the tsconfig option a contributed environment resolves is trusted unchecked
const tsconfigOption = object({
  tsconfig: custom<ResolvedEnvironmentTsconfigOption>((value) => {
    return is(object({ enabled: boolean() }), value);
  }),
});

async function readEnvironmentTsconfigOption(
  config: Resolver<ConfigContext>,
  name: string,
): Promise<ResolvedEnvironmentTsconfigOption> {
  const key = `${name}.options`;

  const option = await config.resolve(key);

  if (!is(tsconfigOption, option)) {
    throw new Error(
      `Config key "${key}" of an environment with a tsconfig resolves to no \`tsconfig\` option`,
    );
  }

  return option.tsconfig;
}

async function readTsconfigOption(
  config: ConfigResolver,
  key: TsconfigKey,
): Promise<ResolvedEnvironmentTsconfigOption> {
  if (key !== "tests.dist") {
    return readEnvironmentTsconfigOption(config, key);
  }

  const tests = await config.resolve("tests.options");

  return tests.dist.tsconfig;
}

export async function resolveEnvironmentTsconfig(
  config: ConfigResolver,
  key: TsconfigKey,
): Promise<ResolvedEnvironmentTsconfig> {
  const {
    location,
    ...resolved
  } = resolveTsconfig(await readTsconfigOption(config, key));

  function path(): Promise<File | undefined> {
    return location === undefined
      ? Promise.resolve(undefined)
      : locateFile(config.context, location.file, location.configured);
  }

  return freeze(
    compose(
      { ...resolved },
      compose.getters({
        path,
      }),
    ),
  );
}
