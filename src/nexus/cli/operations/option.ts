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
  readonly separator?: string;
  readonly choices?: readonly string[];
  readonly conflicts?: readonly string[];
  parse?(item: string): unknown;
}

type OptionInput = BooleanOptionInput | StringOptionInput;

type OptionField = keyof BooleanOptionInput | keyof StringOptionInput;

type StringItem<Input> = Input extends {
  parse(...parameters: never): infer Parsed;
}
  ? Parsed
  : Input extends { readonly choices: readonly (infer Choice)[] }
    ? Choice
    : string;

type StringValue<Input> = Input extends
  { readonly multiple: true } | { readonly separator: string }
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
 * when given, or a string option whose value lists its items when `multiple`,
 * each repeat adding its own, or given a `separator`: each value given, split by
 * the `separator` into trimmed items, empty ones dropped, each item in `choices`
 * when it has them and mapped by `parse`. Its value is `undefined` when not
 * given, unless it has a `default` or is `required`.
 *
 * @pure
 */
export function option<const Input extends OptionInput>(
  input: Input & Readonly<Record<Exclude<keyof Input, OptionField>, never>>,
): OptionDeclaration<Input["name"], OptionValue<Input>>;
export function option(input: OptionInput): OptionDeclaration {
  const required = input.type === "string" && input.required === true;

  const multiple = input.type === "string" && input.multiple === true;

  const separator = input.type === "string" ? input.separator : undefined;

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
    ...(separator !== undefined && { separator }),
    list: multiple || separator !== undefined,
    ...(input.type === "string" &&
      input.choices !== undefined && {
        choices: freeze([...input.choices]),
      }),
    conflicts: freeze([...(input.conflicts ?? [])]),
    ...(input.type === "string" &&
      input.parse !== undefined && { parse: input.parse }),
  });
}
