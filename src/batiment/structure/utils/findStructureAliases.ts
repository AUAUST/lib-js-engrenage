import type { Alias } from "#batiment/structure/types/Alias";
import type { NamespaceStructure } from "#batiment/structure/types/NamespaceStructure";

// @debt matches only the `#<name>/*` alias shape of the TypeScript binding, so another language's aliases get no tree label
export function findStructureAliases(
  { root }: NamespaceStructure,
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
