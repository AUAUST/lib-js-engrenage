import type { Resolver } from "#foundation/options/types/Resolver";
import type { Section } from "#foundation/options/types/Section";

export interface InputResolver<
  Context = unknown,
  Sections extends object = Readonly<Record<string, unknown>>,
> extends Resolver<Context, Sections> {
  validate(sections: readonly Section[]): void;
}
