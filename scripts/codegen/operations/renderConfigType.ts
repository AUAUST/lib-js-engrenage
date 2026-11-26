import {
  toJsonSchema,
  type JsonSchema,
  type OverrideSchemaContext,
} from "@valibot/to-json-schema";
import { compile } from "json-schema-to-typescript-lite";

import { isArray, isBoolean, isObject, isString } from "@auaust/toolkit";
import { map } from "@auaust/toolkit/array";
import { mapValues } from "@auaust/toolkit/object";

import { globsSchema } from "#foundation/options/index";
import { extensionOptionSchema } from "#project/config/index";
import { getCoreConfigSchema } from "#scripts/codegen/utils/getCoreConfigSchema";
import { getLazyConfigSchema } from "#scripts/codegen/utils/getLazyConfigSchema";
import { isListAdjustmentSchema } from "#scripts/codegen/utils/isListAdjustmentSchema";
import { isUnionConfigSchema } from "#scripts/codegen/utils/isUnionConfigSchema";
import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";
import type { ObjectConfigSchema } from "#scripts/codegen/types/ObjectConfigSchema";

const namedReference = "#named/";

function findListItem(schema: ConfigSchema): ConfigSchema | undefined {
  if (!isUnionConfigSchema(schema) || schema.options.length !== 2) {
    return;
  }

  const [items, adjustment] = schema.options;

  if (!isListAdjustmentSchema(adjustment) || !isUnionConfigSchema(items)) {
    return;
  }

  return items.options[0];
}

function findManagedListItem(schema: ConfigSchema): ConfigSchema | undefined {
  if (!isUnionConfigSchema(schema) || schema.options.length !== 2) {
    return;
  }

  const [list, flag] = schema.options;

  return flag.type === "boolean" ? findListItem(list) : undefined;
}

function renderItem(schema: ConfigSchema): string {
  const { type, enum: values } = toJsonSchema(schema, {
    errorMode: "throw",
  }) as { type?: string; enum?: readonly string[] };

  if (type === "string" && values === undefined) {
    return "string";
  }

  if (values !== undefined) {
    return values.map((value) => JSON.stringify(value)).join(" | ");
  }

  throw new Error(
    `The list item of type ${schema.type} has no TypeScript form`,
  );
}

function optionsOf(schema: object): unknown {
  return "options" in schema ? schema.options : undefined;
}

const readonlyListTypes = new Map<unknown, string>([
  [optionsOf(globsSchema), "Glob | Globs"],
]);

function resolveType(
  schema: ConfigSchema,
  types: ReadonlyMap<unknown, string>,
): string | undefined {
  const named = types.get(schema);

  if (named !== undefined) {
    return named;
  }

  // @debt every other custom schema is read as `GlobalsFactory`; each named custom schema should map to its own type
  if (schema.type === "custom") {
    return "GlobalsFactory";
  }

  const readonlyList = readonlyListTypes.get(optionsOf(schema));

  if (readonlyList !== undefined) {
    return readonlyList;
  }

  const managed = findManagedListItem(schema);

  if (managed !== undefined) {
    return `ManagedListOption<${renderItem(managed)}>`;
  }

  const list = findListItem(schema);

  return list === undefined ? undefined : `ListOption<${renderItem(list)}>`;
}

function withType(schema: JsonSchema, tsType: string): JsonSchema {
  const typed = { ...schema, tsType };

  return typed;
}

function allowUndefined(
  { entries }: ConfigSchema & ObjectConfigSchema,
  jsonSchema: JsonSchema,
): JsonSchema {
  const properties = mapValues(
    jsonSchema.properties ?? {},
    (property, name): JsonSchema | boolean => {
      if (isBoolean(property) || entries[name]?.type !== "optional") {
        return property;
      }

      const { description, ...rest } = property;

      const wrapped: JsonSchema = {
        anyOf: [rest, withType(rest, "undefined")],
      };

      if (description !== undefined) {
        wrapped.description = description;
      }

      return wrapped;
    },
  );

  return { ...jsonSchema, properties };
}

function isObjectDefinition(definition: JsonSchema | boolean): boolean {
  return !isBoolean(definition) && definition.type === "object";
}

function placeObjectsLast(jsonSchema: JsonSchema): JsonSchema {
  const anyOf = [
    ...(jsonSchema.anyOf ?? []).filter((member) => !isObjectDefinition(member)),
    ...(jsonSchema.anyOf ?? []).filter((member) => isObjectDefinition(member)),
  ];

  return { ...jsonSchema, anyOf };
}

function createOverride(
  names: ReadonlyMap<ConfigSchema, string>,
  types: ReadonlyMap<unknown, string>,
) {
  return ({ valibotSchema, jsonSchema }: OverrideSchemaContext) => {
    const target = getLazyConfigSchema(valibotSchema);

    const referenced = names.get(
      target === undefined ? valibotSchema : getCoreConfigSchema(target),
    );

    if (referenced !== undefined) {
      return withType({ type: "object" }, referenced);
    }

    return overrideSchema({ valibotSchema, jsonSchema }, types);
  };
}

function overrideSchema(
  {
    valibotSchema,
    jsonSchema,
  }: Pick<OverrideSchemaContext, "valibotSchema" | "jsonSchema">,
  types: ReadonlyMap<unknown, string>,
) {
  if (valibotSchema === extensionOptionSchema) {
    return withType({}, "ExtensionOption");
  }

  const tsType = resolveType(valibotSchema, types);

  if (tsType !== undefined) {
    return withType(jsonSchema, tsType);
  }

  if (valibotSchema.type === "union" && jsonSchema.anyOf !== undefined) {
    return placeObjectsLast(jsonSchema);
  }

  if (valibotSchema.type === "strict_object") {
    return allowUndefined(
      valibotSchema as ConfigSchema & ObjectConfigSchema,
      jsonSchema,
    );
  }

  if (valibotSchema.type === "loose_object") {
    return {
      ...allowUndefined(
        valibotSchema as ConfigSchema & ObjectConfigSchema,
        jsonSchema,
      ),
      additionalProperties: true,
    };
  }
}

function resolveNamedReferences(value: unknown): unknown {
  if (isArray(value)) {
    return map(value, resolveNamedReferences);
  }

  if (!isObject(value)) {
    return value;
  }

  const reference = "$ref" in value ? value.$ref : undefined;

  if (isString(reference) && reference.startsWith(namedReference)) {
    return withType({ type: "object" }, reference.slice(namedReference.length));
  }

  return mapValues(value, resolveNamedReferences);
}

export async function renderConfigType({
  core,
  name,
  names,
  types,
  description,
}: {
  core: ConfigSchema;
  name: string;
  names: ReadonlyMap<ConfigSchema, string>;
  types: ReadonlyMap<unknown, string>;
  description: string | undefined;
}): Promise<string> {
  const jsonSchema = toJsonSchema(
    {
      ...core,
    },
    {
      errorMode: "ignore",
      typeMode: "input",
      overrideSchema: createOverride(names, types),
      overrideRef({ valibotSchema }) {
        if (valibotSchema === extensionOptionSchema) {
          return `${namedReference}ExtensionOption`;
        }

        const referenced = names.get(getCoreConfigSchema(valibotSchema));

        return referenced === undefined
          ? undefined
          : `${namedReference}${referenced}`;
      },
    },
  );

  if (description !== undefined) {
    jsonSchema.description = description;
  }

  delete jsonSchema.$defs;

  // @debt the draft 07 JSON schema of valibot is asserted to the draft 04 type of json-schema-to-typescript-lite, which only differs by numeric exclusive bounds that the config sections do not use
  const document = resolveNamedReferences(jsonSchema) as Parameters<
    typeof compile
  >[0];

  const declarations = await compile(document, name, {
    additionalProperties: false,
    unknownAny: true,
  });

  return declarations.replaceAll("}\n/**", "}\n\n/**");
}
