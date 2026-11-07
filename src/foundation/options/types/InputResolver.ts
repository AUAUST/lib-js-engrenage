import type { Resolver } from "#foundation/options/types/Resolver";
import type { Section } from "#foundation/options/types/Section";

export interface InputResolver<Context = unknown> extends Resolver<Context> {
  validate(sections: readonly Section[]): void;
}
