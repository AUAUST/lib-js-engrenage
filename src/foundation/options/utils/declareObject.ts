import { strictObject } from "valibot";

import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { entries as entriesOf, freeze, record } from "@auaust/toolkit/object";

import { createOptionSchema } from "#options/utils/createOptionSchema";
import { resolveDefault } from "#options/utils/resolveDefault";
import type { Declaration } from "#options/types/Declaration";
import type { DeclarationEntries } from "#options/types/DeclarationEntries";
import type { Default } from "#options/types/Default";
import type { Description } from "#options/types/Description";
import type { ObjectContext } from "#options/types/ObjectContext";
import type { ObjectDeclaration } from "#options/types/ObjectDeclaration";
import type { ObjectInput } from "#options/types/ObjectInput";
import type { ObjectResolution } from "#options/types/ObjectResolution";

export function declareObject<
  const Entries extends DeclarationEntries,
  Optional extends
    true | Default<ObjectInput<Entries>, ObjectContext<Entries>> = never,
  const Disabled extends object = never,
>(
  entries: Entries,
  options?: {
    description?: Description;
    optional?: Optional;
    disable?: { readonly value: Disabled };
    assert?(input: ObjectInput<Entries>, path: string): void;
  },
): ObjectDeclaration<
  Entries,
  | ObjectInput<Entries>
  | ([NoInfer<Optional>] extends [never] ? never : undefined)
  | ([NoInfer<Disabled>] extends [never] ? never : false),
  ObjectResolution<Entries, NoInfer<Disabled>>,
  ObjectContext<Entries>
>;
export function declareObject(
  entries: Readonly<Record<string, Declaration<unknown, unknown, unknown>>>,
  options: {
    description?: Description;
    optional?: true | Default<Record<string, unknown>, unknown>;
    disable?: { readonly value: object };
    assert?(input: Record<string, unknown>, path: string): void;
  } = {},
): ObjectDeclaration<
  Readonly<Record<string, Declaration<unknown, unknown, unknown>>>,
  unknown,
  unknown,
  unknown
> {
  const { optional, disable, assert } = options;

  const schema = createOptionSchema(
    strictObject(
      record(
        entriesOf(entries).map(([key, declaration]) => {
          return [key, declaration.schema] as const;
        }),
      ),
    ),
    {
      description: options.description,
      fallback: optional === true ? undefined : optional,
      optional: optional !== undefined,
      disabled: disable !== undefined,
    },
  );

  function resolve(input: unknown, context: unknown, path: string): unknown {
    if (disable !== undefined && input === false) {
      return freeze({ ...disable.value, enabled: false });
    }

    if (input === undefined && optional === undefined) {
      throw new Error(`${path} is required`);
    }

    const source =
      input === undefined && optional !== undefined
        ? optional === true
          ? {}
          : resolveDefault(optional, context)
        : input;

    if (!isPlainObject(source)) {
      throw new TypeError(`${path} must be an object`);
    }

    assert?.(source, path);

    const resolved: Record<string, unknown> = {};

    for (const [key, declaration] of entriesOf(entries)) {
      resolved[key] = declaration.resolve(
        source[key],
        context,
        `${path}.${key}`,
      );
    }

    return freeze(
      disable === undefined ? resolved : { ...resolved, enabled: true },
    );
  }

  return freeze({
    entries,
    schema,
    resolve,
  });
}
