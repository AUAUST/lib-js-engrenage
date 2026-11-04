import type { OptionContext } from "#foundation/options/types/OptionContext";

export function createSections<Sections>(
  resolvers: {
    [Section in keyof Sections]: (
      get: OptionContext<Sections>["get"],
    ) => Sections[Section];
  },
  live: readonly (keyof Sections)[] = [],
): OptionContext<Sections> {
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

  return { get };
}
