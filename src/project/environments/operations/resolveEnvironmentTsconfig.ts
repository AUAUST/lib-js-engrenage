import { boolean, custom, is, object } from "valibot";

import { compose } from "@auaust/toolkit/composer";
import { freeze, record } from "@auaust/toolkit/object";

import {
  locateFile,
  type ConfigContext,
  type ConfigResolver,
} from "#project/config/index";
import { getOptionsKey } from "#project/environments/utils/getOptionsKey";
import {
  resolveTsconfig,
  type ResolvedEnvironmentTsconfig,
  type ResolvedEnvironmentTsconfigOption,
  type TsconfigKey,
} from "#project/tsconfig/index";
import type { Resolver } from "#foundation/options/index";
import type { EnvironmentEntry } from "#project/environments/ports/EnvironmentEntry";
import type { File } from "#types/File";

// @debt the check covers `enabled` only, so the rest of the tsconfig option a contributed environment resolves is trusted unchecked
const tsconfigOption = object({
  tsconfig: custom<ResolvedEnvironmentTsconfigOption>((value) => {
    return is(object({ enabled: boolean() }), value);
  }),
});

async function readTsconfigOption(
  config: Resolver<ConfigContext>,
  entry: EnvironmentEntry,
): Promise<readonly [string, ResolvedEnvironmentTsconfigOption]> {
  const key = getOptionsKey(entry);

  const option = await config.resolve(key);

  if (!is(tsconfigOption, option)) {
    throw new Error(
      `Config key "${key}" of an environment with a tsconfig resolves to no \`tsconfig\` option`,
    );
  }

  return [entry.name, option.tsconfig];
}

export async function resolveEnvironmentTsconfig(
  config: ConfigResolver,
  key: TsconfigKey,
): Promise<ResolvedEnvironmentTsconfig> {
  const contributions = await config.context.registry.contributions(
    "environments",
    config,
  );

  const [groups, tests] = await Promise.all([
    Promise.all(
      contributions
        .filter(({ entry }) => entry.tsconfig === true)
        .map(({ entry }) => readTsconfigOption(config, entry)),
    ),
    config.resolve("tests.options"),
  ]);

  const { location, ...resolved } = resolveTsconfig(
    key,
    record([...groups, ["tests.dist", tests.dist.tsconfig]]),
  );

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
