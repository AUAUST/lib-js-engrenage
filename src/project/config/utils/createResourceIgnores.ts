import { flatMap, includes, map } from "@auaust/primitive-kit/arrays";

import { anchorGlob } from "#foundation/blocks/index";
import type { LocatedResource } from "#project/config/types/LocatedResource";
import type { Glob } from "#types/Glob";
import type { GlobGroup } from "#types/GlobGroup";
import type { Globs } from "#types/Globs";

export function createResourceIgnores(
  resources: readonly LocatedResource[],
  { covered }: { covered: Globs },
): readonly GlobGroup[] {
  const directories = flatMap(resources, ({ location }) => {
    return "directory" in location ? [location.directory] : [];
  });

  const segments = covered.filter((glob) => !/[/*?[!]/.test(glob));

  function isCovered(path: string): boolean {
    return (
      directories.some((directory) => path.startsWith(`${directory}/`)) ||
      path.split("/").some((segment) => includes(segments, segment))
    );
  }

  function listPathLine(path: string): Globs {
    return isCovered(path) ? [] : [`/${path}`];
  }

  const groups = new Map<string, Glob[]>();

  const emitted = new Set<Glob>();

  for (const { title, location } of resources) {
    const lines =
      "globs" in location
        ? map(location.globs, anchorGlob)
        : listPathLine("file" in location ? location.file : location.directory);

    const group = groups.get(title) ?? [];

    groups.set(title, group);

    for (const line of lines) {
      if (emitted.has(line)) {
        continue;
      }

      emitted.add(line);

      group.push(line);
    }
  }

  return flatMap([...groups], ([title, globs]) => {
    return globs.length === 0 ? [] : [{ title, globs }];
  });
}
