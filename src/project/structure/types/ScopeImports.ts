import type { ResolvedAliases } from "#batiment/structure/index";
import type { PackageName } from "#types/PackageName";

/**
 * What a scope's importers resolve their specifiers against: its alias table,
 * keys and targets relative to the scope, and its package name.
 */
export interface ScopeImports {
  readonly aliases: ResolvedAliases;
  readonly packageName?: PackageName | undefined;
}
