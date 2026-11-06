import type { GenericSchema, InferInput, InferOutput } from "valibot";

import { freeze } from "@auaust/toolkit/object";

import { createOptionSchema } from "#foundation/options/utils/createOptionSchema";
import { resolveDefault } from "#foundation/options/utils/resolveDefault";
import { validate } from "#foundation/options/utils/validate";
import type { Declaration } from "#foundation/options/types/Declaration";
import type { Default } from "#foundation/options/types/Default";
import type { Description } from "#foundation/options/types/Description";

type Unless<Flag, Value> = [Flag] extends [never] ? never : Value;

export function declare<
  Base extends GenericSchema,
  Resolved,
  const Disabled = never,
  Context = unknown,
>(
  base: Base,
  options: {
    description?: Description;
    schema?(context: Context): GenericSchema<InferInput<Base>>;
    optional: Default<Resolved, Context>;
    disable?: { readonly value: Disabled };
    adjust(
      input: InferOutput<Base>,
      fallback: () => Resolved,
      context: Context,
      path: string,
    ): Resolved;
  },
): Declaration<
  InferInput<Base> | undefined | Unless<NoInfer<Disabled>, false>,
  NoInfer<Resolved> | NoInfer<Disabled>,
  NoInfer<Context>
>;
export function declare<
  Base extends GenericSchema,
  const Fallback = never,
  const Disabled = never,
  Context = unknown,
>(
  base: Base,
  options?: {
    description?: Description;
    schema?(context: Context): GenericSchema<InferInput<Base>>;
    optional?: Default<Fallback, Context>;
    disable?: { readonly value: Disabled };
  },
): Declaration<
  | InferInput<Base>
  | Unless<NoInfer<Fallback>, undefined>
  | Unless<NoInfer<Disabled>, false>,
  InferOutput<Base> | NoInfer<Fallback> | NoInfer<Disabled>,
  NoInfer<Context>
>;
export function declare(
  base: GenericSchema,
  options: {
    description?: Description;
    schema?(context: unknown): GenericSchema;
    optional?: Default<unknown, unknown>;
    disable?: { readonly value: unknown };
    adjust?(
      input: unknown,
      fallback: () => unknown,
      context: unknown,
      path: string,
    ): unknown;
  } = {},
): Declaration<unknown, unknown, unknown> {
  const { schema: narrow, optional, disable, adjust } = options;

  function create(core: GenericSchema) {
    return createOptionSchema(core, {
      description: options.description,
      fallback: optional,
      optional: optional !== undefined,
      disabled: disable !== undefined,
    });
  }

  function resolve(input: unknown, context: unknown, path: string): unknown {
    const value =
      narrow === undefined
        ? input
        : validate(create(narrow(context)), input, path);

    if (disable !== undefined && value === false) {
      return disable.value;
    }

    if (value === undefined) {
      if (optional === undefined) {
        throw new Error(`${path} is required`);
      }

      return resolveDefault(optional, context);
    }

    if (adjust === undefined) {
      return value;
    }

    return adjust(
      value,
      () => {
        if (optional === undefined) {
          throw new Error(`${path} has no default`);
        }

        return resolveDefault(optional, context);
      },
      context,
      path,
    );
  }

  return freeze({
    schema: create(base),
    resolve,
  });
}
