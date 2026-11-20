import type { EnvironmentStructure } from "#batiment/structure/index";
import type { Alias } from "#project/structure/types/Alias";

export function findStructureAliases(
  { root }: EnvironmentStructure,
  aliases: readonly Alias[],
): Map<string, string> {
  const found = new Map<string, string>();

  for (const child of root.children) {
    const alias = aliases.find(({ key, path }) => {
      return key === `#${child.name}/*` && path === child.path;
    });

    if (alias !== undefined) {
      found.set(child.path, `#${child.name}/…`);
    }
  }

  return found;
}
