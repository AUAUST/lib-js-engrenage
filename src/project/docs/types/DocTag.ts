/**
 * A doc tag read and validated against its declaration.
 *
 * @experimental
 */
export interface DocTag {
  /**
   * The tag name without its `@`.
   */
  readonly name: string;
  /**
   * The `{…}` type expression without its braces, when the tag carries one.
   */
  readonly type?: string;
  /**
   * The parameter, type parameter or name the tag documents, when its declaration
   * takes a subject.
   */
  readonly subject?: string;
  /**
   * `true` for a tag without a body, the body text when its declaration has no
   * schema, and the schema's output otherwise.
   */
  readonly value: unknown;
}
