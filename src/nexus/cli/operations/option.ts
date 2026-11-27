import { isArray } from "@auaust/toolkit";
import { freeze } from "@auaust/toolkit/object";

import type { OptionDeclaration } from "#nexus/cli/types/OptionDeclaration";

interface BooleanOptionInput {
  readonly name: string;
  readonly type: "boolean";
  readonly description?: string;
  readonly short?: string;
  readonly default?: boolean;
  readonly conflicts?: readonly string[];
}

interface StringOptionInput {
  readonly name: string;
  readonly type: "string";
  readonly description?: string;
  readonly short?: string;
  readonly placeholder?: string;
  readonly default?: unknown;
  readonly required?: boolean;
  readonly multiple?: boolean;
  readonly choices?: readonly string[];
  readonly conflicts?: readonly string[];
  parse?(value: string, previous: unknown): unknown;
}

type OptionInput = BooleanOptionInput | StringOptionInput;

type OptionField = keyof BooleanOptionInput | keyof StringOptionInput;

type StringItem<Input> = Input extends {
  readonly choices: readonly (infer Choice)[];
}
  ? Choice
  : string;

type StringValue<Input> = Input extends {
  parse(...parameters: never): infer Parsed;
}
  ? Parsed
  : Input extends { readonly multiple: true }
    ? StringItem<Input>[]
    : StringItem<Input>;

type Presence<Input> = Input extends
  { readonly default: NonNullable<unknown> } | { readonly required: true }
  ? never
  : undefined;

type OptionValue<Input> =
  | (Input extends { readonly type: "boolean" }
      ? Input extends { readonly default: boolean }
        ? boolean
        : true
      : StringValue<Input>)
  | Presence<Input>;

/**
 * Declares an option keyed by its name, its long flag: a boolean flag, `true`
 * when given, or a string option whose value `parse` reduces from each value
 * given, each repeat adding one with `multiple`. Its value is `undefined` when
 * not given, unless it has a `default` or is `required`.
 *
 * @pure
 */
export function option<const Input extends OptionInput>(
  input: Input & Readonly<Record<Exclude<keyof Input, OptionField>, never>>,
): OptionDeclaration<Input["name"], OptionValue<Input>>;
export function option(input: OptionInput): OptionDeclaration {
  const required = input.type === "string" && input.required === true;

  const multiple = input.type === "string" && input.multiple === true;

  function collect(value: string, previous: unknown): unknown {
    return isArray(previous) && previous !== input.default
      ? [...previous, value]
      : [value];
  }

  function parse(value: string, previous: unknown): unknown {
    if (input.type === "string" && input.parse !== undefined) {
      return input.parse(value, previous);
    }

    return multiple ? collect(value, previous) : value;
  }

  return freeze({
    name: input.name,
    type: input.type,
    ...(input.description !== undefined && {
      description: input.description,
    }),
    ...(input.short !== undefined && { short: input.short }),
    ...(input.type === "string" &&
      input.placeholder !== undefined && {
        placeholder: input.placeholder,
      }),
    ...(input.default !== undefined && { default: input.default }),
    required,
    multiple,
    ...(input.type === "string" &&
      input.choices !== undefined && {
        choices: freeze([...input.choices]),
      }),
    conflicts: freeze([...(input.conflicts ?? [])]),
    ...(input.type === "string" && { parse }),
  });
}
