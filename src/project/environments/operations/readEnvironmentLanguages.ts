import { array, is, looseObject, optional, string } from "valibot";

import { freeze } from "@auaust/toolkit/object";

import {
  memoizeByContext,
  type ConfigContext,
  type ConfigResolver,
} from "#project/config/index";
import { listEnvironmentEntries } from "#project/environments/operations/listEnvironmentEntries";
import { getOptionsKey } from "#project/environments/utils/getOptionsKey";
import type { Resolver } from "#foundation/options/index";
import type { LanguageEntry } from "#project/environments/ports/LanguageEntry";

const languagesOption = looseObject({
  dirs: array(string()),
  languages: optional(array(string())),
});

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

async function createEnvironmentLanguages(
  config: ConfigResolver,
  environment: string,
): Promise<readonly LanguageEntry[]> {
  const [entries, contributions] = await Promise.all([
    listEnvironmentEntries(config),
    config.context.registry.contributions("languages", config),
  ]);

  const contributed = entries.find(({ entry }) => entry.name === environment);

  if (contributed === undefined) {
    throw new Error(
      `No active extension contributes the ${environment} environment`,
    );
  }

  const key = getOptionsKey(contributed);
  const resolver: Resolver<ConfigContext> = config;

  const option = await resolver.resolve(key);

  if (!is(languagesOption, option)) {
    throw new Error(
      `Config key "${key}" resolves to no environment options: it lacks a \`dirs\` list, or holds a \`languages\` that is not a list`,
    );
  }

  const metafile = await readMetafileLanguages(
    config,
    environment,
    option.dirs,
  );

  if (metafile !== undefined && option.languages !== undefined) {
    const origin = await config.origin(key, `${environment}.languages`);

    if (origin.layer === "input") {
      throw new Error(
        `The ${environment} environment sets languages in both ${key}.languages and ${metafile.file}`,
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

  const names = option.languages ?? contributed.kind.languages ?? [];

  return freeze(
    names.map((name) => {
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
 * Reads the languages an environment selects, from its `.environment.json`, its
 * options or its kind, once per config context.
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
