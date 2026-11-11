import { record, type GenericSchema } from "valibot";

import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { entries, freeze } from "@auaust/toolkit/object";

import { createOptionSchema } from "#foundation/options/utils/createOptionSchema";
import { resolveDefault } from "#foundation/options/utils/resolveDefault";
import type { Declaration } from "#foundation/options/types/Declaration";
import type { Default } from "#foundation/options/types/Default";
import type { Description } from "#foundation/options/types/Description";

/** @stable */
export function declareRecord<
  Input,
  Output,
  Context,
  Fallback extends Readonly<Record<string, Input>> = never,
>(
  key: GenericSchema<string>,
  value: Declaration<Input, Output, Context>,
  options?: {
    description?: Description;
    optional?: Default<Fallback, Context>;
  },
): Declaration<
  | Readonly<Record<string, Input>>
  | ([NoInfer<Fallback>] extends [never] ? never : undefined),
  Readonly<Record<string, Output>>,
  Context
>;
export function declareRecord(
  key: GenericSchema<string>,
  value: Declaration<unknown, unknown, unknown>,
  options: {
    description?: Description;
    optional?: Default<unknown, unknown>;
  } = {},
): Declaration<unknown, unknown, unknown> {
  const { optional } = options;

  const schema = createOptionSchema(record(key, value.schema), {
    description: options.description,
    fallback: optional,
    optional: optional !== undefined,
    disabled: false,
  });

  function resolve(input: unknown, context: unknown, path: string): unknown {
    const source = input === undefined && optional !== undefined
      ? resolveDefault(optional, context)
      : input;

    if (!isPlainObject(source)) {
      throw new TypeError(`${path} must be an object`);
    }

    const resolved: Record<string, unknown> = {};

    for (const [name, member] of entries(source)) {
      resolved[name] = value.resolve(member, context, `${path}.${name}`);
    }

    return freeze(resolved);
  }

  return freeze({ schema, resolve });
}
