import type { Resolver } from "#foundation/options/apis/Resolver";

export interface InputResolver<
  Context = unknown,
  Sections extends object = Readonly<Record<string, unknown>>,
> extends Resolver<Context, Sections> {
  /**
   * Validates the input of every section in `keys`, and rejects input keys none
   * of them reads.
   *
   * @throws Once, listing every invalid input and unknown key.
   */
  validate(keys: readonly string[]): Promise<void>;
  /**
   * Drops the resolved values, so each next read recomputes its section; validated
   * inputs stay cached.
   */
  forget(): void;
}
