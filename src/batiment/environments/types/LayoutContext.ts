/**
 * What an environment's `layout` option resolves against: the names of the
 * contributed layouts and the layout of the environment's kind.
 */
export interface LayoutContext {
  readonly layouts: readonly string[];
  readonly layout: string | undefined;
}
