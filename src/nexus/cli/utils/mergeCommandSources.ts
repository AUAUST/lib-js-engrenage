import { join } from "@auaust/toolkit/array";

import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { ProvidedEntry } from "#nexus/cli/types/ProvidedEntry";
import type { ProvidedSource } from "#nexus/cli/types/ProvidedSource";

/**
 * Checks that no two of `sources`, provided in order by the group at `path`,
 * provide one name, unless the later one is shadowable.
 *
 * @returns The entries each name leads to, earlier sources winning.
 * @throws {TypeError} When two sources provide one name, the later not shadowable,
 * or one source provides a name twice.
 * @pure
 */
export function mergeCommandSources(
  sources: readonly ProvidedSource[],
  path: CommandPath,
): readonly ProvidedEntry[] {
  const owners = new Map<
    string,
    { readonly source: ProvidedSource; readonly label: string }
  >();

  const merged: ProvidedEntry[] = [];
  const group = join(path, " ");

  for (const source of sources) {
    for (const provided of source.entries) {
      const taken = provided.names.filter((name) => {
        const owner = owners.get(name);

        if (owner?.source === source && owner.label === provided.label) {
          throw new TypeError(
            `The '${name}' command in '${group}' comes twice from ${provided.label}`,
          );
        }

        if (
          owner !== undefined &&
          (owner.source === source || !source.shadowable)
        ) {
          throw new TypeError(
            `The '${name}' command in '${group}' comes from both ${owner.label} and ${provided.label}`,
          );
        }

        return owner !== undefined;
      });

      if (taken.includes(provided.name)) {
        continue;
      }

      for (const name of provided.names) {
        if (!owners.has(name)) {
          owners.set(name, { source, label: provided.label });
        }
      }

      merged.push(provided);
    }
  }

  return merged;
}
