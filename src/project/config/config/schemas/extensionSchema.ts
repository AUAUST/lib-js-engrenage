import {
  array,
  check,
  custom,
  exactOptional,
  intersect,
  literal,
  looseObject,
  objectWithRest,
  pipe,
  record,
  string,
  type GenericSchema,
} from "valibot";

import { isFunction } from "@auaust/toolkit/isFunction";
import { isPlainObject } from "@auaust/toolkit/isPlainObject";

import type { SlotDeclaration } from "#foundation/extensions/index";
import type { Extension } from "#project/config/types/Extension";
import type { FileResource } from "#project/config/types/FileResource";
import type { KeyDeclaration } from "#project/config/types/KeyDeclaration";

type Owned = NonNullable<Extension["owns"]>;

type Contributed = NonNullable<Extension["contributes"]>;

function isCallable(input: unknown): boolean {
  return isFunction(input);
}

function isPartKey(input: string): boolean {
  return input.includes("#");
}

const objectSchema = looseObject({});

const ownsSchema: GenericSchema<unknown, Owned> = objectWithRest(
  {
    keys: exactOptional(
      record(
        string(),
        looseObject({
          input: exactOptional(string()),
          load: custom<KeyDeclaration["load"]>(
            isCallable,
            "Expected a load function",
          ),
        }),
      ),
    ),
    slots: exactOptional(
      record(
        string(),
        custom<SlotDeclaration>(isPlainObject, "Expected a slot declaration"),
      ),
    ),
    files: exactOptional(
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
    parts: exactOptional(
      record(
        pipe(string(), check(isPartKey, "Expected a key holding #")),
        literal(true),
      ),
    ),
  },
  record(string(), objectSchema),
);

// @debt contributed entries are typed as their slot's entries although only their `load` is checked here; the slot's entry validator checks the rest at collection
const contributesSchema = intersect([
  custom<Contributed>(isPlainObject),
  record(
    string(),
    array(
      looseObject({
        load: exactOptional(
          custom<() => Promise<unknown>>(
            isCallable,
            "Expected a load function",
          ),
        ),
      }),
    ),
  ),
]);

export const extensionSchema: GenericSchema<unknown, Extension> = looseObject({
  name: string(),
  title: exactOptional(string()),
  requires: exactOptional(array(string())),
  when: exactOptional(looseObject({ installed: string() })),
  owns: exactOptional(ownsSchema),
  contributes: exactOptional(contributesSchema),
});
