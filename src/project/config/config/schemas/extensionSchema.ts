import {
  array,
  custom,
  literal,
  looseObject,
  objectWithRest,
  optional,
  pipe,
  record,
  string,
  type GenericSchema,
} from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";
import { isString } from "@auaust/toolkit/isString";

import type { SlotDeclaration } from "#foundation/extensions/index";
import type { Extension } from "#project/config/types/Extension";
import type { FileResource } from "#project/config/types/FileResource";
import type { KeyDeclaration } from "#project/config/types/KeyDeclaration";

type Owned = NonNullable<Extension["owns"]>;

type Contributed = NonNullable<Extension["contributes"]>;

function isCallable(input: unknown): boolean {
  return isFunction(input);
}

function isPartKey(input: unknown): boolean {
  return isString(input) && input.includes("#");
}

const objectSchema = looseObject({});

const ownsSchema: GenericSchema<unknown, Owned> = objectWithRest(
  {
    keys: optional(
      record(
        string(),
        looseObject({
          input: optional(string()),
          load: custom<KeyDeclaration["load"]>(
            isCallable,
            "Expected a load function",
          ),
        }),
      ),
    ),
    slots: optional(
      record(
        string(),
        custom<SlotDeclaration>(isPlainObject, "Expected a slot declaration"),
      ),
    ),
    files: optional(
      record(
        string(),
        looseObject({
          locate: custom<FileResource["locate"]>(
            isCallable,
            "Expected a locate function",
          ),
        }),
      ),
    ),
    parts: optional(
      record(
        custom<`${string}#${string}`>(isPartKey, "Expected a key holding #"),
        literal(true),
      ),
    ),
  },
  record(string(), objectSchema),
);

// @debt contributed entries are typed as their slot's entries although only their `load` is checked here; the slot's entry validator checks the rest at collection
const contributesSchema = pipe(
  record(
    string(),
    array(
      looseObject({
        load: optional(
          custom<() => Promise<unknown>>(isCallable, "Expected a load function"),
        ),
      }),
    ),
  ),
  custom<Contributed>(isPlainObject),
);

export const extensionSchema: GenericSchema<unknown, Extension> = looseObject({
  name: string(),
  title: optional(string()),
  requires: optional(array(string())),
  when: optional(looseObject({ installed: string() })),
  owns: optional(ownsSchema),
  contributes: optional(contributesSchema),
});
