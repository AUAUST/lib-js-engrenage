import type { InwardPolicy } from "#batiment/scopes/types/InwardPolicy";
import type { NamespaceImports } from "#batiment/scopes/types/NamespaceImports";
import type { TestVariant } from "#batiment/scopes/types/TestVariant";

/**
 * The boundary facts of a top-level namespace, reusable by name: each top-level
 * namespace takes the kind named like it.
 */
export interface NamespaceKind {
  /**
   * Names the kind, which the top-level namespace of the same name takes.
   */
  readonly name: string;
  // @debt only `enforced` changes behavior, so what sets `foreign` apart from `described` is unstated
  /**
   * How far engrenage checks the kind's namespaces: an `enforced` namespace's
   * code files are linted and, with a `structure`, aliased.
   */
  readonly level: "foreign" | "described" | "enforced";
  /**
   * How the tree of the kind's namespaces is structured: `domains` into
   * namespaces and domains, `roles` into role files only; without one, they have
   * no structure, roles or aliases.
   */
  readonly structure?: "domains" | "roles";
  /**
   * The layout the kind's namespaces take unless their options name another.
   */
  readonly layout?: string;
  /**
   * Whether the code of the kind's namespaces ships with the package (`published`)
   * or stays in the repository (`private`); without one, it counts as neither.
   */
  readonly code?: "published" | "private";
  /**
   * The kinds whose namespaces in the same scope the kind's namespaces import,
   * by relation: `whole` any file, `surface` only a domain's `index`, `entry`
   * and public roles.
   */
  readonly imports?: NamespaceImports;
  /**
   * What other namespaces' grants into the kind's namespaces yield: `open` the
   * grant as given, `surface` at most surface, `sealed`, the default, nothing.
   */
  readonly inward?: InwardPolicy;
  /**
   * Whether the kind's root-scope namespaces hold the package entries: their
   * files are imported through `#…` aliases, the `internal-aliases` import
   * category, and from outside the package through its name.
   */
  readonly entries?: boolean;
  /**
   * The test files the kind's namespaces hold, by variant; without any, their
   * files have no variant.
   */
  readonly variants?: readonly TestVariant[];
}
