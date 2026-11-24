import { freeze, getOwn, keys } from "@auaust/toolkit/object";

import { rootScope } from "#batiment/scopes/constants";
import { reconcileEnvironmentDirs } from "#batiment/scopes/index";
import { declareSection, type OutputOf } from "#foundation/options/index";
import { environmentsSchema } from "#project/environments/config/schemas/environmentsSchema";
import { listEnvironmentEntries } from "#project/environments/operations/listEnvironmentEntries";
import { readEnvironmentOptions } from "#project/environments/operations/readEnvironmentOptions";
import type { EnvironmentRegistration } from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";
import type { Execution } from "#project/environments/types/Execution";

async function listDefaultRegistrations(
  config: ConfigResolver,
): Promise<readonly EnvironmentRegistration[]> {
  const [entries, claims] = await Promise.all([
    listEnvironmentEntries(config),
    config.resolve("environments.claims"),
  ]);

  return Promise.all(
    entries.map(async ({ entry: { name, preset = name } }) => {
      const { option } = await readEnvironmentOptions(config, name);

      const dirs = reconcileEnvironmentDirs(name, option.dirs, claims);

      const kept = dirs.filter((directory) => directory !== rootScope);

      return freeze({
        name,
        preset,
        // @debt `<name>.languages` tunes the built-in registration beside `environments.<name>.languages`, two options for one fact, kept since dropping it changes a user surface no issue states
        ...(option.languages === undefined
          ? {}
          : { languages: option.languages }),
        dirs: freeze(kept),
        files: freeze(
          kept.length === dirs.length ? [] : [...(option.files ?? [])],
        ),
      });
    }),
  );
}

function registerEnvironment(
  name: string,
  input: OutputOf<typeof environmentsSchema>[string] | undefined,
  fallback: EnvironmentRegistration | undefined,
): EnvironmentRegistration {
  const preset = input?.preset ?? fallback?.preset;

  if (preset === undefined) {
    throw new Error(
      `The environment ${name} names no preset: set environments.${name}.preset`,
    );
  }

  const languages = input?.languages ?? fallback?.languages;

  const { globals, apis, syntax, module } = input?.execution ?? {};

  const execution: Execution = {
    ...(globals === undefined ? {} : { globals }),
    ...(apis === undefined ? {} : { apis }),
    ...(syntax === undefined ? {} : { syntax }),
    ...(module === undefined ? {} : { module }),
  };

  const bundled = input?.bundled;

  return freeze({
    name,
    preset,
    ...(languages === undefined ? {} : { languages }),
    ...(keys(execution).length === 0 ? {} : { execution: freeze(execution) }),
    ...(bundled === undefined ? {} : { bundled }),
    dirs: input?.dirs ?? fallback?.dirs ?? freeze([]),
    files: input?.files ?? fallback?.files ?? freeze([]),
  });
}

export const environmentsSection = declareSection({
  declaration: environmentsSchema,
  async resolve(
    input,
    config: ConfigResolver,
  ): Promise<readonly EnvironmentRegistration[]> {
    const registered = environmentsSchema.resolve(
      input,
      { reporter: config.context.reporter },
      "environments",
    );

    const defaults = await listDefaultRegistrations(config);

    const names = new Set([
      ...defaults.map(({ name }) => name),
      ...keys(registered),
    ]);

    return freeze(
      [...names].map((name) => {
        return registerEnvironment(
          name,
          getOwn(registered, name),
          defaults.find((registration) => registration.name === name),
        );
      }),
    );
  },
});
