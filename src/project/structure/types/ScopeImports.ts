import type { Alias } from "#batiment/structure/index";
import type { PackageName } from "#types/PackageName";

/**
 * What a scope's importers resolve their specifiers against: its alias table,
 * the generated aliases then those only its `package.json` `imports` declares,
 * keys and targets relative to the scope, and its package name.
 */
export interface ScopeImports {
  readonly aliases: readonly Alias[];
  readonly packageName?: PackageName | undefined;
}
