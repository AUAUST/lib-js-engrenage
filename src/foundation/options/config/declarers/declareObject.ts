import { strictObject, type StrictObjectIssue } from "valibot";

import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";
import {
  entries as entriesOf,
  freeze,
  hasOwn,
  record,
} from "@auaust/toolkit/object";

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
 * rejecting unknown keys. A missing input throws at resolve unless `optional`
 * is set: `true` resolves the entries from an empty object, a default from
 * its value. With `disable`, a `false` input resolves to `disable.value` with
 * `enabled: false`, and any other input adds `enabled: true`. `assert` checks
 * the input before its entries resolve and throws to reject it; the unknown-key
 * error of a former key in `renamed` names the key replacing it.
 *
 * @stable
 */
export function declareObject<
  const Entries extends DeclarationEntries,
  Optional = never,
  const Disabled extends object = never,
  DefaultContext = unknown,
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
  },
): ObjectDeclaration<
  Entries,
  | ObjectInput<Entries>
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
  } = {},
): ObjectDeclaration<
  Readonly<Record<string, Declaration<unknown, unknown, unknown>>>,
  unknown,
  unknown,
  unknown
> {
  const { optional, disable, assert, renamed = {} } = options;

  function describe(issue: StrictObjectIssue): string {
    const replacement = (
      issue.expected === "never" &&
      isString(issue.input) &&
      hasOwn(renamed, issue.input)
    )
      ? renamed[issue.input]
      : undefined;

    return replacement === undefined
      ? issue.message
      : `Unknown key ${issue.received}, renamed "${replacement}"`;
  }

  const schema = createOptionSchema(
    strictObject(
      record(
        entriesOf(entries).map(([key, declaration]) => {
          return [key, declaration.schema] as const;
        }),
      ),
      describe,
    ),
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
      return freeze({ ...disable.value, enabled: false });
    }

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
