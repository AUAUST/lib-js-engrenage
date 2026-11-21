/**
 * A fixed shape: each directory of the environment root is one of `entries`.
 *
 * @experimental
 */
export interface StaticLayout {
  /**
   * Tells this layout apart from the other natures.
   */
  readonly nature: "static";
  /**
   * The name environment kinds and options select the layout by.
   */
  readonly name: string;
  /**
   * The root directories the layout allows, by name: each classified as its
   * `role` or, without one, walked as a namespace; a `required` one must exist.
   * Any other root directory is reported and left unclassified.
   */
  readonly entries: Readonly<
    Record<string, { readonly role?: string; readonly required?: boolean }>
  >;
}
