import { create, defineGetter, freeze } from "@auaust/toolkit/object";

import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { SectionResolvers } from "#foundation/options/types/SectionResolvers";

export function createSections<Sections extends object>(
  resolvers: SectionResolvers<Sections>,
  live: readonly (keyof Sections)[] = [],
): OptionContext<Sections> & { readonly sections: Sections } {
  const memos: { [Section in keyof Sections]?: { value: Sections[Section] } } =
    {};

  const resolving: PropertyKey[] = [];

  function get<Section extends keyof Sections>(
    section: Section,
  ): Sections[Section] {
    const memo = memos[section];

    if (memo !== undefined) {
      return memo.value;
    }

    const start = resolving.indexOf(section);

    if (start !== -1) {
      const path = [...resolving.slice(start), section];

      throw new Error(
        `Config sections depend on each other: ${path.map(String).join(" -> ")}`,
      );
    }

    resolving.push(section);

    try {
      const value = resolvers[section](get);

      if (!live.includes(section)) {
        memos[section] = { value };
      }

      return value;
    } finally {
      resolving.pop();
    }
  }

  const sections: Sections = create(null);

  for (const section in resolvers) {
    defineGetter(sections, section, () => get(section));
  }

  return { get, sections: freeze(sections) };
}
