import type { Resolver } from "#foundation/options/apis/Resolver";
import type { Declaration } from "#foundation/options/ports/Declaration";

// @debt the resolver context is typed `unknown`, so sections narrow it by annotating their `config` parameter, which method bivariance accepts unchecked
/**
 * @stable
 */
export interface Section<Output = unknown> {
  readonly declaration: Declaration<unknown, unknown, unknown> | undefined;
  readonly live: boolean;
  resolve(input: unknown, config: Resolver): Output | Promise<Output>;
}
