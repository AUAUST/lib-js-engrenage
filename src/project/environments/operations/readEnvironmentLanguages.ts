import { freeze } from "@auaust/toolkit/object";

import { memoizeByContext, type ConfigResolver } from "#project/config/index";
import type { RegisteredEnvironment } from "#batiment/environments/index";
import type { LanguageEntry } from "#project/environments/ports/LanguageEntry";

const readsFor = memoizeByContext(() => {
  return new Map<string, Promise<readonly LanguageEntry[]>>();
});

async function findRegisteredEnvironment(
  config: ConfigResolver,
  environment: string,
): Promise<RegisteredEnvironment> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const registered = environments.registered.find(({ registration }) => {
    return registration.name === environment;
  });

  if (registered === undefined) {
    throw new Error(
      `No environment named ${environment} is registered: add it to environments`,
    );
  }

  return registered;
}

async function createEnvironmentLanguages(
  config: ConfigResolver,
  environment: string,
): Promise<readonly LanguageEntry[]> {
  const [registered, contributions] = await Promise.all([
    findRegisteredEnvironment(config, environment),
    config.context.registry.contributions("languages", config),
  ]);

  const byName = new Map(contributions.map(({ entry }) => [entry.name, entry]));

  return freeze(
    registered.languages.map((name) => {
      const language = byName.get(name);

      if (language === undefined) {
        throw new Error(
          `The ${environment} environment selects the language ${name}, which no active extension contributes`,
        );
      }

      return language;
    }),
  );
}

/**
 * Reads the languages a registered environment selects, from its registration's
 * tuning or its preset, once per config context.
 */
export function readEnvironmentLanguages(
  config: ConfigResolver,
  environment: string,
): Promise<readonly LanguageEntry[]> {
  const reads = readsFor(config.context);

  let read = reads.get(environment);

  if (read === undefined) {
    read = createEnvironmentLanguages(config, environment);

    reads.set(environment, read);
  }

  return read;
}
