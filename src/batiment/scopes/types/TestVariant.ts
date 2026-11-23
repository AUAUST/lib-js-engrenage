/**
 * One kind of test file a namespace kind's namespaces hold, matched by its marker
 * and granted by how it reaches the namespaces holding the package entries.
 */
export interface TestVariant {
  readonly name: string;
  /**
   * The glob part telling the variant's files apart, between the test suffix and
   * the extension; empty for test files no other variant marks.
   */
  readonly marker: string;
  /**
   * The builds the variant's files run against: the source, the build
   * output, or both.
   */
  readonly against: readonly ("source" | "dist")[];
  /**
   * The import category through which the variant's files reach the namespaces
   * holding the package entries in a published package: `public-entries` the
   * package name only, `internal-aliases` their `#…` aliases only.
   */
  readonly through: "public-entries" | "internal-aliases";
}
