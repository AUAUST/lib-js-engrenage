import { isArray } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { LayerLoader } from "#nexus/cli/types/LayerLoader";

interface ArgumentInput {
  readonly name: string;
  readonly description?: string;
  readonly optional?: boolean;
  readonly variadic?: boolean;
  readonly separator?: string;
  readonly choices?: readonly string[] | LayerLoader<readonly string[]>;
  parse?(item: string): unknown;
}

type ArgumentItem<Input> = Input extends {
  parse(...parameters: never): infer Parsed;
}
  ? Parsed
  : Input extends { readonly choices: readonly (infer Choice)[] }
    ? Choice
    : string;

type IsList<Input> = Input extends
  { readonly variadic: true } | { readonly separator: string }
  ? true
  : false;

type IsOptional<Input> = Input extends { readonly optional: true }
  ? true
  : false;

/**
 * Declares a positional argument, required unless `optional`, whose value lists
 * its items when `variadic` or given a `separator`: each value given, split by
 * the `separator` into trimmed items, empty ones dropped, each item in `choices`
 * when it has them and mapped by `parse`.
 *
 * @pure
 */
export function argument<const Input extends ArgumentInput>(
  input: Input &
    Readonly<Record<Exclude<keyof Input, keyof ArgumentInput>, never>>,
): ArgumentDeclaration<ArgumentItem<Input>, IsList<Input>, IsOptional<Input>>;
export function argument(input: ArgumentInput): ArgumentDeclaration {
  const variadic = input.variadic === true;

  return freeze({
    name: input.name,
    ...(input.description !== undefined && {
      description: input.description,
    }),
    optional: input.optional === true,
    variadic,
    ...(input.separator !== undefined && { separator: input.separator }),
    list: variadic || input.separator !== undefined,
    ...(input.choices !== undefined && {
      choices: isArray(input.choices)
        ? freeze([...input.choices])
        : input.choices,
    }),
    ...(input.parse !== undefined && { parse: input.parse }),
  });
}
