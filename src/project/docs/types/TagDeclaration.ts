import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * How a doc tag is written and checked; lint, the formatter and the build read
 * the project's declarations from `docs.tags`.
 *
 * @experimental
 */
export interface TagDeclaration {
  /**
   * The tag name without its `@`, declared once among the project's tags.
   */
  readonly name: string;
  /**
   * Whether the tag takes a `{…}` type expression after its name; unset, a type
   * is rejected.
   */
  readonly type?: "required" | "optional";
  /**
   * What the required word after the type names; lint checks a `parameter` or
   * `typeParameter` against the documented signature.
   */
  readonly subject?: "parameter" | "typeParameter" | "name";
  /**
   * The text after the tag's head: `none` rejects any, `inline` takes one line,
   * `text` wrapped prose and `code` lines kept verbatim.
   */
  readonly body: "none" | "inline" | "text" | "code";
  /**
   * Validates the body synchronously: its output becomes the read tag's value
   * and its issues are reported. Reading the tag throws when it validates
   * asynchronously.
   */
  readonly schema?: StandardSchemaV1<string>;
  /**
   * Whether a block may carry the tag more than once.
   */
  readonly multiple?: boolean;
  /**
   * Tag names never carried in the same block, checked from either side.
   */
  readonly excludes?: readonly string[];
  /**
   * `export` for a tag of the whole export, carried only by its first overload;
   * `signature`, the default, for a tag of each signature.
   */
  readonly scope?: "signature" | "export";
  /**
   * `internal` trims the tag from built declarations; `public`, the default,
   * keeps it.
   */
  readonly output?: "public" | "internal";
}
