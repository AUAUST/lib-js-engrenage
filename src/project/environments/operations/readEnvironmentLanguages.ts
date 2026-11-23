import { freeze } from "@auaust/toolkit/object";

import { memoizeByContext, type ConfigResolver } from "#project/config/index";
import { listEnvironmentEntries } from "#project/environments/operations/listEnvironmentEntries";
import type { RegisteredEnvironment } from "#batiment/environments/index";
import type { LanguageEntry } from "#project/environments/ports/LanguageEntry";

const readsFor = memoizeByContext(() => {
  return new Map<string, Promise<readonly LanguageEntry[]>>();
});

async function readMetafileLanguages(
  config: ConfigResolver,
  environment: string,
  dirs: readonly string[],
): Promise<
  { readonly names: readonly string[]; readonly file: string } | undefined
> {
  const { environments } = await config.resolve("scopes.discovery");

  let found:
    { readonly names: readonly string[]; readonly file: string } | undefined;

  for (const dir of dirs) {
    const metafile = environments.find((discovered) => discovered.dir === dir);

    if (metafile?.languages === undefined) {
      continue;
    }

    if (found !== undefined) {
      throw new Error(
        `The ${environment} environment sets languages in both ${found.file} and ${metafile.file}`,
      );
    }

    found = { names: metafile.languages, file: metafile.file };
  }

  return found;
}

/**
 * Finds the option setting the environment's languages tuning in the config
 * input, rather than in a default layer a metafile overrides.
 */
async function findTuningInput(
  config: ConfigResolver,
  environment: string,
): Promise<string | undefined> {
  const registered = `environments.${environment}.languages`;

  const { layer } = await config.origin("environments", registered);

  if (layer === "input") {
    return registered;
  }

  const entries = await listEnvironmentEntries(config);

  if (!entries.some(({ entry }) => entry.name === environment)) {
    return;
  }

  const key = `${environment}.options`;

  const origin = await config.origin(key, `${environment}.languages`);

  return origin.layer === "input" ? `${key}.languages` : undefined;
}

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

  const metafile = await readMetafileLanguages(
    config,
    environment,
    registered.dirs,
  );

  if (
    metafile !== undefined &&
    registered.registration.languages !== undefined
  ) {
    const tuning = await findTuningInput(config, environment);

    if (tuning !== undefined) {
      throw new Error(
        `The ${environment} environment sets languages in both ${tuning} and ${metafile.file}`,
      );
    }
  }

  const byName = new Map(contributions.map(({ entry }) => [entry.name, entry]));

  if (metafile !== undefined) {
    return freeze(
      metafile.names.flatMap((name) => {
        const language = byName.get(name);

        return language === undefined ? [] : [language];
      }),
    );
  }

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
 * Reads the languages a registered environment selects, from its
 * `.environment.json`, its registration's tuning or its preset, once per
 * config context.
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
