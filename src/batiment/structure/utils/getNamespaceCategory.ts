import type { ImportCategory } from "#batiment/structure/types/ImportCategory";

export function getNamespaceCategory(
  namespace: string,
  entries: readonly string[],
): ImportCategory {
  return entries.includes(namespace) ? "internal-aliases" : namespace;
}
