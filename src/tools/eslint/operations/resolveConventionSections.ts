import { flatMap, map } from "@auaust/primitive-kit/arrays";
import { entries, freeze, record } from "@auaust/toolkit/object";

import type { Section } from "#foundation/options/index";
import type { LoadedConfig } from "#project/config/index";
import type { Convention } from "#tools/eslint/types/Convention";
import type { ConventionSections } from "#tools/eslint/types/ConventionSections";
import type { ConventionValues } from "#tools/eslint/types/ConventionValues";
import type { ResolvedSections } from "#tools/eslint/types/ResolvedSections";

export async function resolveConventionSections(
  config: LoadedConfig,
  conventions: readonly Convention[],
): Promise<ResolvedSections> {
  const sections = new Set(flatMap(conventions, ({ sections }) => sections));

  const resolved = new Map<Section, unknown>(
    await Promise.all(
      map([...sections], async (section) => {
        return [section, await config.resolve(section)] as const;
      }),
    ),
  );

  function has(section: Section): boolean {
    return resolved.has(section);
  }

  function read(section: Section): unknown {
    if (!resolved.has(section)) {
      throw new Error(
        `Config section ${section.name} was not resolved for the enabled conventions`,
      );
    }

    return resolved.get(section);
  }

  function pick<Sections extends ConventionSections>(
    declared: Sections | undefined,
  ): ConventionValues<Sections> {
    const picked = map(
      entries<ConventionSections>(declared ?? {}),
      ([name, section]) => {
        return [name, read(section)] as const;
      },
    );

    // @debt the record is built from the declared sections at runtime, so its type is asserted; a typed record mapper would infer it
    return freeze(record(picked)) as ConventionValues<Sections>;
  }

  return {
    has,
    pick,
  };
}
