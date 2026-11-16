import { iterable, object } from "@auaust/toolkit";

import type { ConfigKey, LoadedConfig } from "#project/config/index";
import type { Convention } from "#tools/eslint/ports/Convention";
import type { ConventionSections } from "#tools/eslint/types/ConventionSections";
import type { ConventionValues } from "#tools/eslint/types/ConventionValues";
import type { ResolvedSections } from "#tools/eslint/types/ResolvedSections";

export async function resolveConventionSections(
  config: LoadedConfig,
  conventions: readonly Convention[],
): Promise<ResolvedSections> {
  const keys = new Set(
    iterable.flatMap(conventions, ({ sections }) => {
      return sections;
    }),
  );

  const resolved = new Map<ConfigKey, unknown>(
    await Promise.all(
      iterable.map(keys, async (key) => {
        return [key, await config.resolve(key)] as const;
      }),
    ),
  );

  function has(key: ConfigKey): boolean {
    return resolved.has(key);
  }

  function read(key: ConfigKey): unknown {
    if (!resolved.has(key)) {
      throw new Error(
        `Config key "${key}" was not resolved for the enabled conventions`,
      );
    }

    return resolved.get(key);
  }

  function pick<Sections extends ConventionSections>(
    declared: Sections | undefined,
  ): ConventionValues<Sections> {
    const picked = iterable.map(
      object.entries<ConventionSections>(declared ?? {}),
      ([name, key]) => {
        return [name, read(key)] as const;
      },
    );

    // @debt the record is built from the declared sections at runtime, so its type is asserted; a typed record mapper would infer it
    return object.freeze(object.record(picked)) as ConventionValues<Sections>;
  }

  return {
    has,
    pick,
  };
}
