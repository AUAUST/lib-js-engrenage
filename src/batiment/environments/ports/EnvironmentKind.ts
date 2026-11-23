export interface EnvironmentKind {
  /**
   * Names the kind, which each environment of this kind names as its `kind`.
   */
  readonly name: string;
  /**
   * The languages the kind's environments select unless their options or
   * `.environment.json` name others.
   */
  readonly languages?: readonly string[];
}
