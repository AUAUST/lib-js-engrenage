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
   * Whether the kind's environments import `src` only through a domain's `index`,
   * `entry` and public roles.
   */
  readonly consumesSource?: boolean;
  /**
   * The other kinds whose environments' files the kind's environments may
   * import, besides their own.
   */
  readonly imports?: readonly string[];
  /**
   * The layout the kind's environments take unless their options name another.
   */
  readonly layout?: string;
}
