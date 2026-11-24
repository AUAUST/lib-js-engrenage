import {
  array,
  check,
  custom,
  exactOptional,
  instance,
  intersect,
  literal,
  looseObject,
  objectWithRest,
  picklist,
  pipe,
  record,
  string,
  union,
  type GenericSchema,
} from "valibot";

import { isFunction, isPlainObject } from "@auaust/toolkit";

import { keyScopes } from "#project/config/constants";
import type { SlotDeclaration } from "#foundation/extensions/index";
import type { DirectiveDeclaration } from "#project/config/types/DirectiveDeclaration";
import type { Extension } from "#project/config/types/Extension";
import type { FileResource } from "#project/config/types/FileResource";
import type { KeyDeclaration } from "#project/config/types/KeyDeclaration";

type Owned = NonNullable<Extension["owns"]>;

type Contributed = NonNullable<Extension["contributes"]>;

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
          scope: exactOptional(picklist(keyScopes)),
          load: custom<KeyDeclaration["load"]>(
            isFunction,
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
            isFunction,
            "Expected a locate function",
          ),
          scope: exactOptional(picklist(["project", "scoped"])),
        }),
      ),
    ),
    parts: exactOptional(
      record(
        pipe(string(), check(isPartKey, "Expected a key holding #")),
        literal(true),
      ),
    ),
    directives: exactOptional(
      record(
        string(),
        looseObject({
          files: custom<DirectiveDeclaration["files"]>(
            isFunction,
            "Expected a files function",
          ),
          load: custom<DirectiveDeclaration["load"]>(
            isFunction,
            "Expected a load function",
          ),
        }),
      ),
    ),
    markers: exactOptional(record(string(), literal(true))),
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
            isFunction,
            "Expected a load function",
          ),
        ),
      }),
    ),
  ),
]);

const whenSchema = union([
  looseObject({ config: string() }),
  looseObject({ installed: string(), preset: exactOptional(string()) }),
  looseObject({ preset: string() }),
]);

export const extensionSchema: GenericSchema<unknown, Extension> = looseObject({
  name: string(),
  title: exactOptional(string()),
  requires: exactOptional(array(string())),
  when: exactOptional(whenSchema),
  root: exactOptional(instance(URL)),
  compatibility: exactOptional(looseObject({ engrenage: string() })),
  owns: exactOptional(ownsSchema),
  contributes: exactOptional(contributesSchema),
});
