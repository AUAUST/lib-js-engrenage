import { freeze } from "@auaust/toolkit/object";

import type { Declaration } from "#foundation/options/types/Declaration";
import type { Resolver } from "#foundation/options/types/Resolver";
import type { Section } from "#foundation/options/types/Section";

// @debt `Config` comes from the section's own annotation, unchecked against the resolver `createResolver` passes
export function declareSection<
  Input,
  Output,
  Config extends Resolver<unknown, object> = Resolver,
>(options: {
  declaration: Declaration<Input, unknown, unknown>;
  live?: boolean;
  resolve(input: Input, config: Config): Output | Promise<Output>;
}): Section<Output>;
export function declareSection<
  Output,
  Config extends Resolver<unknown, object> = Resolver,
>(options: {
  live?: boolean;
  resolve(input: undefined, config: Config): Output | Promise<Output>;
}): Section<Output>;
export function declareSection({
  declaration,
  live = false,
  resolve,
}: {
  declaration?: Declaration<unknown, unknown, unknown>;
  live?: boolean;
  resolve(input: unknown, config: Resolver): unknown;
}): Section {
  return freeze({
    declaration,
    live,
    resolve,
  });
}
