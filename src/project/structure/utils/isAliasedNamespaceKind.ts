import type { NamespaceKind } from "#batiment/scopes/index";

export function isAliasedNamespaceKind({
  level,
  structure,
}: NamespaceKind): boolean {
  return level === "enforced" && structure !== undefined;
}
