import { looseObject, strictObject, type StrictObjectIssue } from "valibot";

import { isPlainObject, isString, object } from "@auaust/toolkit";

import { createOptionSchema } from "#foundation/options/utils/createOptionSchema";
import { resolveDefault } from "#foundation/options/utils/resolveDefault";
import type { Declaration } from "#foundation/options/ports/Declaration";
import type { Default } from "#foundation/options/ports/Default";
import type { DeclarationEntries } from "#foundation/options/types/DeclarationEntries";
import type { Description } from "#foundation/options/types/Description";
import type { ObjectContext } from "#foundation/options/types/ObjectContext";
import type { ObjectDeclaration } from "#foundation/options/types/ObjectDeclaration";
import type { ObjectInput } from "#foundation/options/types/ObjectInput";
import type { ObjectResolution } from "#foundation/options/types/ObjectResolution";

/**
 * Declares an object option resolving each of `entries` from its key, and
 * rejecting unknown keys unless `loose` is set, which accepts them unvalidated
 * and leaves them out of the resolved value. A missing input resolves, with
 * `optional` `true`, the entries from an empty object, and with a default, from
 * its value. With `disable`, a `false` input resolves to `disable.value` with
 * `enabled: false`, and any other input adds `enabled: true`. `assert` checks
 * the input before its entries resolve; the unknown-key error of a former
 * key in `renamed` names the key replacing it, and of one in `removed`, the
 * reason it was removed.
 *
 * @throws {Error} At resolve, when the input is missing and `optional` unset.
 * @throws {TypeError} At resolve, when the input is no plain object.
 * @throws At resolve, whatever `assert` throws to reject the input.
 * @stable
 */
export function declareObject<
  const Entries extends DeclarationEntries,
  Optional = never,
  const Disabled extends object = never,
  DefaultContext = unknown,
  const Loose extends boolean = false,
>(
  entries: Entries,
  options?: {
    description?: Description;
    optional?: Optional &
      (
        | true
        | Default<
            ObjectInput<Entries> | ([Disabled] extends [never] ? never : false),
            DefaultContext
          >
      );
    disable?: { readonly value: Disabled };
    assert?(input: ObjectInput<Entries>, path: string): void;
    renamed?: Readonly<Record<string, keyof Entries & string>>;
    removed?: Readonly<Record<string, string>>;
    loose?: Loose;
  },
): ObjectDeclaration<
  Entries,
  | (ObjectInput<Entries> &
      ([Loose] extends [true] ? Readonly<Record<string, unknown>> : unknown))
  | ([NoInfer<Optional>] extends [never] ? never : undefined)
  | ([NoInfer<Disabled>] extends [never] ? never : false),
  ObjectResolution<Entries, NoInfer<Disabled>>,
  ObjectContext<Entries> & NoInfer<DefaultContext>
>;
export function declareObject(
  entries: Readonly<Record<string, Declaration<unknown, unknown, unknown>>>,
  options: {
    description?: Description;
    optional?: true | Default<Record<string, unknown> | false, unknown>;
    disable?: { readonly value: object };
    assert?(input: Record<string, unknown>, path: string): void;
    renamed?: Readonly<Record<string, string>>;
    removed?: Readonly<Record<string, string>>;
    loose?: boolean;
  } = {},
): ObjectDeclaration<
  Readonly<Record<string, Declaration<unknown, unknown, unknown>>>,
  unknown,
  unknown,
  unknown
> {
  const {
    optional,
    disable,
    assert,
    renamed = {},
    removed = {},
    loose = false,
  } = options;

  function describe(issue: StrictObjectIssue): string {
    const key = issue.expected === "never" && isString(issue.input)
      ? issue.input
      : undefined;

    if (key !== undefined && object.hasOwn(renamed, key)) {
      return `Unknown key ${issue.received}, renamed "${renamed[key]}"`;
    }

    if (key !== undefined && object.hasOwn(removed, key)) {
      return `Unknown key ${issue.received}, removed: ${removed[key]}`;
    }

    return issue.message;
  }

  const shape = object.record(
    object.entries(entries).map(([key, declaration]) => {
      return [key, declaration.schema] as const;
    }),
  );

  const schema = createOptionSchema(
    loose ? looseObject(shape) : strictObject(shape, describe),
    {
      description: options.description,
      fallback: optional === true ? undefined : optional,
      optional: optional !== undefined,
      disabled: disable !== undefined,
    },
  );

  function resolve(input: unknown, context: unknown, path: string): unknown {
    if (input === undefined && optional === undefined) {
      throw new Error(`${path} is required`);
    }

    const source = input === undefined && optional !== undefined
      ? optional === true
        ? {}
        : resolveDefault(optional, context)
      : input;

    if (disable !== undefined && source === false) {
      return object.freeze({ ...disable.value, enabled: false });
    }

    if (!isPlainObject(source)) {
      throw new TypeError(`${path} must be an object`);
    }

    assert?.(source, path);

    const resolved: Record<string, unknown> = {};

    for (const [key, declaration] of object.entries(entries)) {
      resolved[key] = declaration.resolve(
        source[key],
        context,
        `${path}.${key}`,
      );
    }

    return object.freeze(
      disable === undefined ? resolved : { ...resolved, enabled: true },
    );
  }

  return object.freeze({
    entries,
    schema,
    resolve,
  });
}
