import type { OptionContext } from "#foundation/options/types/OptionContext";
import type { SectionResolvers } from "#foundation/options/types/SectionResolvers";

export function createSections<Sections extends object>(
  resolvers: SectionResolvers<Sections>,
  live: readonly (keyof Sections)[] = [],
): OptionContext<Sections> {
  const memos = new Map<keyof Sections, Promise<unknown>>();
  const waits = new Map<keyof Sections, Set<keyof Sections>>();

  function findPath(
    from: keyof Sections,
    to: keyof Sections,
  ): (keyof Sections)[] | undefined {
    const visited = new Set<keyof Sections>();

    function walk(
      section: keyof Sections,
      path: (keyof Sections)[],
    ): (keyof Sections)[] | undefined {
      if (section === to) {
        return path;
      }

      if (visited.has(section)) {
        return;
      }

      visited.add(section);

      for (const next of waits.get(section) ?? []) {
        const found = walk(next, [...path, next]);

        if (found !== undefined) {
          return found;
        }
      }
    }

    return walk(from, [from]);
  }

  function createGet(
    dependent: keyof Sections | undefined,
  ): OptionContext<Sections>["get"] {
    async function get<Section extends keyof Sections>(
      section: Section,
    ): Promise<Sections[Section]> {
      if (dependent !== undefined) {
        const cycle = findPath(section, dependent);

        if (cycle !== undefined) {
          throw new Error(
            `Config sections depend on each other: ${[...cycle, section].map(String).join(" -> ")}`,
          );
        }

        const dependencies = waits.get(dependent) ?? new Set();

        dependencies.add(section);
        waits.set(dependent, dependencies);
      }

      const memo = memos.get(section);

      if (memo !== undefined) {
        return memo as Promise<Sections[Section]>;
      }

      const pending = (async () => {
        return resolvers[section](createGet(section));
      })();

      if (!live.includes(section)) {
        memos.set(section, pending);

        pending.catch(() => {
          if (memos.get(section) === pending) {
            memos.delete(section);
          }
        });
      }

      return pending;
    }

    return get;
  }

  return { get: createGet(undefined) };
}
