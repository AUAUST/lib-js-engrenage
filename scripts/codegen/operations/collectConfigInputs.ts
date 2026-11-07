import { toPascalCase } from "@auaust/primitive-kit/strings";
import { isArray } from "@auaust/toolkit/isArray";
import { isObject } from "@auaust/toolkit/isObject";
import { entries, values } from "@auaust/toolkit/object";

import { getCoreConfigSchema } from "#scripts/codegen/utils/getCoreConfigSchema";
import { getLazyConfigSchema } from "#scripts/codegen/utils/getLazyConfigSchema";
import { isConfigSchema } from "#scripts/codegen/utils/isConfigSchema";
import { isListAdjustmentSchema } from "#scripts/codegen/utils/isListAdjustmentSchema";
import { isUnionConfigSchema } from "#scripts/codegen/utils/isUnionConfigSchema";
import type { ConfigSchema } from "#scripts/codegen/types/ConfigSchema";
import type { ObjectConfigSchema } from "#scripts/codegen/types/ObjectConfigSchema";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

interface Declaration {
  schema: ConfigSchema;
  entries: Readonly<Record<string, unknown>>;
}

interface DeclaredInput {
  name: string;
  domain: Directory;
  declaration: Declaration;
}

type SchemaModules = ReadonlyMap<File, Readonly<Record<string, unknown>>>;

function isDeclaration(value: unknown): value is Declaration {
  return (
    isObject(value) &&
    "schema" in value &&
    isConfigSchema(value.schema) &&
    "entries" in value &&
    isObject(value.entries)
  );
}

function isObjectConfigSchema(
  schema: ConfigSchema,
): schema is ConfigSchema & ObjectConfigSchema {
  return schema.type === "strict_object";
}

function childrenOf(schema: ConfigSchema): ConfigSchema[] {
  if ("pipe" in schema && isArray(schema.pipe)) {
    return [schema.pipe[0]];
  }

  if (isObjectConfigSchema(schema)) {
    return values(schema.entries);
  }

  const target = getLazyConfigSchema(schema);

  if (target !== undefined) {
    return [target];
  }

  return ["wrapped", "item", "key", "value"].flatMap((property) => {
    const child = (schema as unknown as Record<string, unknown>)[property];

    return isConfigSchema(child) ? [child] : [];
  });
}

function countObjects(root: ConfigSchema): Map<ConfigSchema, number> {
  const counts = new Map<ConfigSchema, number>();

  function visit(schema: ConfigSchema) {
    const members =
      isUnionConfigSchema(schema) && !("pipe" in schema) ? schema.options : [];

    if (isObjectConfigSchema(schema) && !("pipe" in schema)) {
      const seen = counts.has(schema);

      counts.set(schema, (counts.get(schema) ?? 0) + 1);

      if (seen) {
        return;
      }
    }

    for (const child of [...childrenOf(schema), ...members]) {
      visit(child);
    }
  }

  visit(root);

  return counts;
}

function collectDeclaredInputs(
  modules: SchemaModules,
): Map<ConfigSchema, DeclaredInput> {
  const inputs = new Map<ConfigSchema, DeclaredInput>();

  for (const [file, exported] of modules) {
    const domain = file.slice("src/".length, file.lastIndexOf("/config/"));

    for (const [exportName, value] of entries(exported)) {
      if (
        !isDeclaration(value) ||
        !isObjectConfigSchema(getCoreConfigSchema(value.schema))
      ) {
        continue;
      }

      inputs.set(getCoreConfigSchema(value.schema), {
        name: `${toPascalCase(exportName.replace(/Schema$/, ""))}Input`,
        domain,
        declaration: value,
      });
    }
  }

  return inputs;
}

function selectInputs(
  declared: ReadonlyMap<ConfigSchema, DeclaredInput>,
  sections: Readonly<Record<string, ConfigSchema>>,
  root: ConfigSchema,
): Map<ConfigSchema, DeclaredInput> {
  const counts = countObjects(root);

  const selected = new Map<ConfigSchema, DeclaredInput>();

  const wanted = [
    ...values(sections).map(getCoreConfigSchema),
    ...[...counts].filter(([, count]) => count > 1).map(([core]) => core),
  ];

  for (const core of wanted) {
    const input = declared.get(core);

    if (
      core === root ||
      !isObjectConfigSchema(core) ||
      isListAdjustmentSchema(core)
    ) {
      continue;
    }

    if (input === undefined) {
      throw new Error(
        "A config schema used more than once has no exported declaration to name its interface",
      );
    }

    selected.set(core, input);
  }

  return selected;
}

export function collectConfigInputs(
  modules: SchemaModules,
  sections: Readonly<Record<string, ConfigSchema>>,
  root: ConfigSchema,
) {
  return selectInputs(collectDeclaredInputs(modules), sections, root);
}
