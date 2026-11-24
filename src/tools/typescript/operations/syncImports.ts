import { isDeepStrictEqual } from "node:util";

import {
  array,
  lazy,
  null_,
  optional,
  record as recordOf,
  string,
  union,
  type GenericSchema,
} from "valibot";

import { isArray, isPlainObject, isString } from "@auaust/toolkit";
import { keys } from "@auaust/toolkit/object";

import { syncFiles } from "#foundation/blocks/index";
import { readJsonValue } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/index";
import { readGeneratedKeys, writeGeneratedKeys } from "#project/sync/index";
import { mergeGenerated } from "#tools/typescript/utils/mergeGenerated";
import type { LoadedConfig } from "#project/config/index";
import type { ImportTarget } from "#tools/typescript/types/ImportTarget";
import type { File } from "#types/File";

const importTargetSchema: GenericSchema<ImportTarget> = lazy(() => {
  return union([
    string(),
    null_(),
    array(importTargetSchema),
    recordOf(string(), importTargetSchema),
  ]);
});

const importsSchema = optional(recordOf(string(), importTargetSchema));

function matchesImport(current: ImportTarget, generated: ImportTarget) {
  if (isDeepStrictEqual(current, generated)) {
    return true;
  }

  return (
    isString(current) &&
    isPlainObject(generated) &&
    isArray(generated.types) &&
    generated.types.includes(current)
  );
}

export async function syncImports(
  config: LoadedConfig,
  file: File,
  imports: Readonly<Record<string, ImportTarget>>,
) {
  const part = `${file}#imports`;

  const recorded = await readGeneratedKeys(config, part);

  await syncFiles(
    {
      filesystem: config.context.filesystem,
      resolve: config.context.path,
    },
    [
      {
        file,
        update(content, path) {
          const current = validate(
            importsSchema,
            readJsonValue(content, path, ["imports"]),
            `${path} imports`,
          );

          if (keys(imports).length === 0 && current === undefined) {
            return content;
          }

          return writePackageJsonValue(
            content,
            path,
            ["imports"],
            mergeGenerated<ImportTarget>(
              path,
              current ?? {},
              imports,
              recorded,
              matchesImport,
            ),
            jsonIndentation,
          );
        },
      },
    ],
  );

  await writeGeneratedKeys(config, part, keys(imports));
}
