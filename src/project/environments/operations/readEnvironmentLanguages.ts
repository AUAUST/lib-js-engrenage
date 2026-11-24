import { memoizeByContext, type ConfigResolver } from "#project/config/index";
import { selectLanguages } from "#project/environments/operations/selectLanguages";
import type { RegisteredEnvironment } from "#batiment/environments/index";
import type { EnvironmentLanguage } from "#project/environments/types/EnvironmentLanguage";

const readsFor = memoizeByContext(() => {
  return new Map<string, Promise<readonly EnvironmentLanguage[]>>();
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
): Promise<readonly EnvironmentLanguage[]> {
  const registered = await findRegisteredEnvironment(config, environment);

  return selectLanguages(
    config,
    registered.languages,
    `The ${environment} environment`,
  );
}

/**
 * Reads the languages a registered environment selects, from its registration's
 * tuning or its preset, once per config context.
 */
export function readEnvironmentLanguages(
  config: ConfigResolver,
  environment: string,
): Promise<readonly EnvironmentLanguage[]> {
  const reads = readsFor(config.context);

  let read = reads.get(environment);

  if (read === undefined) {
    read = createEnvironmentLanguages(config, environment);

    reads.set(environment, read);
  }

  return read;
}
