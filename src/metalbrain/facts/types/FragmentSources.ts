/**
 * Where instruction fragments come from: the active extensions' names and the
 * package roots shipping fragments, metalbrain's data root first.
 */
export interface FragmentSources {
  readonly extensions: ReadonlySet<string>;
  readonly origins: readonly URL[];
}
