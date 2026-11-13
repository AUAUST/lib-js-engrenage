import type { Resolver } from "#foundation/options/apis/Resolver";
import type { Declaration } from "#foundation/options/ports/Declaration";

// @debt the resolver context is typed `unknown`, so sections narrow it by annotating their `config` parameter, which method bivariance accepts unchecked
/**
 * @stable
 */
export interface Section<Output = unknown> {
  /**
   * The declaration validating the section's input; `undefined` when the section
   * reads no input.
   */
  readonly declaration: Declaration<unknown, unknown, unknown> | undefined;
  /**
   * Whether the resolver recomputes the section on each read instead of caching
   * it; a cached section reading a live one recomputes when that value changes.
   */
  readonly live: boolean;
  /**
   * Computes the section's value from its validated input, `undefined` without
   * a declaration, reading other sections through `config`.
   */
  resolve(input: unknown, config: Resolver): Output | Promise<Output>;
}
