import type { Alias } from "#batiment/structure/index";
import type { PackageName } from "#types/PackageName";

/**
 * What a scope's importers resolve their specifiers against: its alias table,
 * the generated aliases then those only its `package.json` `imports` declares,
 * keys and targets relative to the scope, and its package name; and what other
 * scopes reach by that name: each subpath key of its `package.json` `exports`,
 * `*` patterns included, with whether it has a target, or `undefined` when it
 * declares no `exports` and so exposes every subpath.
 */
export interface ScopeImports {
  readonly aliases: readonly Alias[];
  readonly packageName?: PackageName | undefined;
  readonly exports?: Readonly<Record<string, boolean>> | undefined;
}
