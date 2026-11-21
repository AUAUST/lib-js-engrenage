import type { EnvironmentRelation } from "#batiment/environments/types/EnvironmentRelation";
import type { InwardPolicy } from "#batiment/environments/types/InwardPolicy";

export interface EnvironmentKind {
  /**
   * Names the kind, which each environment of this kind names as its `kind`.
   */
  readonly name: string;
  // @debt only `enforced` changes behavior, so what sets `foreign` apart from `described` is unstated
  /**
   * How far engrenage checks the kind's environments: an `enforced` environment's
   * code files are linted and, with a `structure`, aliased.
   */
  readonly level: "foreign" | "described" | "enforced";
  /**
   * How the tree of the kind's environments is structured: `domains` into
   * namespaces and domains, `roles` into role files only; without one, they have
   * no structure, roles or aliases.
   */
  readonly structure?: "domains" | "roles";
  /**
   * The kinds whose environments in the same scope the kind's environments
   * import, by relation: `whole` any file, `surface` only a domain's `index`,
   * `entry` and public roles.
   */
  readonly imports?: Readonly<Record<string, EnvironmentRelation>>;
  /**
   * What other environments' grants into the kind's environments yield: `open` the
   * grant as given, `surface` at most surface, `sealed`, the default, nothing.
   */
  readonly inward?: InwardPolicy;
  /**
   * The layout the kind's environments take unless their options name another.
   */
  readonly layout?: string;
  /**
   * The languages the kind's environments select unless their options or
   * `.environment.json` name others.
   */
  readonly languages?: readonly string[];
}
