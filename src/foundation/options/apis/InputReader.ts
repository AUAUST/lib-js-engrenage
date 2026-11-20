import type { Resolver } from "#foundation/options/apis/Resolver";
import type { Declaration } from "#foundation/options/ports/Declaration";
import type { ValueOrigin } from "#foundation/options/types/ValueOrigin";

export interface InputReader<Context = unknown> {
  /**
   * The input `name`, with its default layers applied and validated against
   * `declaration`; cached per declaration once valid.
   *
   * @throws When the input is invalid.
   */
  read(
    name: string,
    declaration: Declaration<unknown, unknown, unknown>,
    reader: Resolver<Context>,
  ): Promise<unknown>;
  /**
   * The source of the value at `path`, dotted under `name`, as `Resolver.origin`
   * states it.
   *
   * @throws When the input is invalid, or `path` is not under `name`.
   */
  origin(
    name: string,
    path: string,
    declaration: Declaration<unknown, unknown, unknown>,
    reader: Resolver<Context>,
  ): Promise<ValueOrigin>;
}
