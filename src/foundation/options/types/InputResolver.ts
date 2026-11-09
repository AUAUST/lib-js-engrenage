import type { Resolver } from "#foundation/options/types/Resolver";

export interface InputResolver<
  Context = unknown,
  Sections extends object = Readonly<Record<string, unknown>>,
> extends Resolver<Context, Sections> {
  validate(keys: readonly string[]): Promise<void>;
}
