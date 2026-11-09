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
  name: string;
  declaration: Declaration<Input, unknown, unknown>;
  live?: boolean;
  resolve(input: Input, config: Config): Output | Promise<Output>;
}): Section<Output>;
export function declareSection<
  Output,
  Config extends Resolver<unknown, object> = Resolver,
>(options: {
  name: string;
  live?: boolean;
  resolve(input: undefined, config: Config): Output | Promise<Output>;
}): Section<Output>;
export function declareSection({
  name,
  declaration,
  live = false,
  resolve,
}: {
  name: string;
  declaration?: Declaration<unknown, unknown, unknown>;
  live?: boolean;
  resolve(input: unknown, config: Resolver): unknown;
}): Section {
  return freeze({
    name,
    declaration,
    live,
    resolve,
  });
}
