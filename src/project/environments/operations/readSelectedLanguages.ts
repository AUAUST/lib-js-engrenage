import { flatMap, map, toDeduplicated } from "@auaust/toolkit/array";
import { freeze } from "@auaust/toolkit/object";

import { readEnvironmentLanguages } from "#project/environments/operations/readEnvironmentLanguages";
import type { ConfigResolver } from "#project/config/index";
import type { LanguageEntry } from "#project/environments/ports/LanguageEntry";

/**
 * Reads each language an environment registered in any scope selects, its
 * extensions those of all its selections.
 */
export async function readSelectedLanguages(
  config: ConfigResolver,
): Promise<readonly LanguageEntry[]> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const selections = flatMap(
    await Promise.all(
      map(environments.registered, async ({ scope, registration }) => {
        return readEnvironmentLanguages(
          await config.context.scope(scope),
          registration.name,
        );
      }),
    ),
    (languages) => languages,
  );

  const byName = new Map<string, LanguageEntry>();

  for (const { options: _options, ...selection } of selections) {
    const known = byName.get(selection.name);

    byName.set(
      selection.name,
      known === undefined
        ? selection
        : {
            ...known,
            extensions: toDeduplicated([
              ...known.extensions,
              ...selection.extensions,
            ]),
          },
    );
  }

  return freeze(map([...byName.values()], (language) => freeze(language)));
}
