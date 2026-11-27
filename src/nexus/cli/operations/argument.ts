import { isArray } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { LayerLoader } from "#nexus/cli/types/LayerLoader";

interface ArgumentInput {
  readonly name: string;
  readonly description?: string;
  readonly optional?: boolean;
  readonly variadic?: boolean;
  readonly choices?: readonly string[] | LayerLoader<readonly string[]>;
  parse?(value: string): unknown;
}

type ArgumentItem<Input> = Input extends {
  parse(...parameters: never): infer Parsed;
}
  ? Parsed
  : Input extends { readonly choices: readonly (infer Choice)[] }
    ? Choice
    : string;

type ArgumentValue<Input> = Input extends { readonly variadic: true }
  ? ArgumentItem<Input>[]
  : Input extends { readonly optional: true }
    ? ArgumentItem<Input> | undefined
    : ArgumentItem<Input>;

/**
 * Declares a positional argument, required unless `optional`, whose value `parse`
 * maps from the value given, or from each one given when `variadic`.
 *
 * @pure
 */
export function argument<const Input extends ArgumentInput>(
  input: Input &
    Readonly<Record<Exclude<keyof Input, keyof ArgumentInput>, never>>,
): ArgumentDeclaration<ArgumentValue<Input>>;
export function argument(input: ArgumentInput): ArgumentDeclaration {
  const variadic = input.variadic === true;

  function map(value: string): unknown {
    return input.parse === undefined ? value : input.parse(value);
  }

  function parse(value: string, previous: unknown): unknown {
    return variadic
      ? [...(isArray(previous) ? previous : []), map(value)]
      : map(value);
  }

  return freeze({
    name: input.name,
    ...(input.description !== undefined && {
      description: input.description,
    }),
    optional: input.optional === true,
    variadic,
    ...(input.choices !== undefined && {
      choices: isArray(input.choices)
        ? freeze([...input.choices])
        : input.choices,
    }),
    parse,
  });
}
