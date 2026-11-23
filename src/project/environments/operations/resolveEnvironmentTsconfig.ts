import { boolean, custom, is, object } from "valibot";

import { compose } from "@auaust/toolkit/composer";
import { freeze, record } from "@auaust/toolkit/object";

import {
  locateFile,
  type ConfigContext,
  type ConfigResolver,
} from "#project/config/index";
import { listTsconfigRegistrations } from "#project/environments/operations/listTsconfigRegistrations";
import {
  resolveTsconfig,
  type ResolvedEnvironmentTsconfig,
  type ResolvedEnvironmentTsconfigOption,
  type TsconfigKey,
} from "#project/tsconfig/index";
import type { EnvironmentRegistration } from "#batiment/environments/index";
import type { Resolver } from "#foundation/options/index";
import type { File } from "#types/File";

// @debt the check covers `enabled` only, so the rest of the tsconfig option a contributed environment resolves is trusted unchecked
const tsconfigOption = object({
  tsconfig: custom<ResolvedEnvironmentTsconfigOption>((value) => {
    return is(object({ enabled: boolean() }), value);
  }),
});

async function readTsconfigOption(
  config: Resolver<ConfigContext>,
  { name }: EnvironmentRegistration,
): Promise<readonly [string, ResolvedEnvironmentTsconfigOption]> {
  const key = `${name}.options`;

  const option = await config.resolve(key);

  if (!is(tsconfigOption, option)) {
    throw new Error(
      `Config key "${key}" of an environment with a tsconfig resolves to no \`tsconfig\` option`,
    );
  }

  return [name, option.tsconfig];
}

export async function resolveEnvironmentTsconfig(
  config: ConfigResolver,
  key: TsconfigKey,
): Promise<ResolvedEnvironmentTsconfig> {
  const registrations = await listTsconfigRegistrations(config);

  const [groups, tests] = await Promise.all([
    Promise.all(
      registrations.map((registration) => {
        return readTsconfigOption(config, registration);
      }),
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
