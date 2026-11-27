import { isArray } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import type { ArgumentDeclaration } from "#nexus/cli/types/ArgumentDeclaration";
import type { LayerLoader } from "#nexus/cli/types/LayerLoader";

interface BaseArgumentInput {
  readonly name: string;
  readonly description?: string;
  readonly optional?: boolean;
  readonly variadic?: boolean;
  readonly choices?: readonly string[] | LayerLoader<readonly string[]>;
}

interface MappedArgumentInput extends BaseArgumentInput {
  parse?(value: string): unknown;
}

interface ReducedArgumentInput extends BaseArgumentInput {
  reduce(value: string, previous: unknown): unknown;
}

type ArgumentInput = MappedArgumentInput | ReducedArgumentInput;

type ArgumentField = keyof MappedArgumentInput | keyof ReducedArgumentInput;

type ArgumentItem<Input> = Input extends {
  parse(...parameters: never): infer Parsed;
}
  ? Parsed
  : Input extends { readonly choices: readonly (infer Choice)[] }
    ? Choice
    : string;

type ArgumentValues<Input> = Input extends {
  reduce(...parameters: never): infer Reduced;
}
  ? Reduced
  : Input extends { readonly variadic: true }
    ? ArgumentItem<Input>[]
    : ArgumentItem<Input>;

type ArgumentValue<Input> = Input extends { readonly variadic: true }
  ? ArgumentValues<Input>
  : Input extends { readonly optional: true }
    ? ArgumentValues<Input> | undefined
    : ArgumentValues<Input>;

/**
 * Declares a positional argument, required unless `optional`, whose value `parse`
 * maps from the value given, or from each one given when `variadic`; or `reduce`
 * reduces from each value given, with its value so far.
 *
 * @pure
 */
export function argument<const Input extends ArgumentInput>(
  input: Input & Readonly<Record<Exclude<keyof Input, ArgumentField>, never>>,
): ArgumentDeclaration<ArgumentValue<Input>>;
export function argument(input: ArgumentInput): ArgumentDeclaration {
  const variadic = input.variadic === true;

  function map(value: string): unknown {
    return "parse" in input && input.parse !== undefined
      ? input.parse(value)
      : value;
  }

  function parse(value: string, previous: unknown): unknown {
    if ("reduce" in input) {
      return input.reduce(value, previous);
    }

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
