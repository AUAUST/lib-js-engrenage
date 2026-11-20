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
import { map, sort } from "@auaust/toolkit/array";
import { entries, hasOwn, keys, record } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { emptyObjectFile } from "#foundation/json/constants";
import {
  applyJsonEdits,
  readJsonValue,
  type JsonValue,
} from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/index";
import { readGeneratedKeys, writeGeneratedKeys } from "#project/sync/index";
import {
  readTsconfigPaths,
  toTsconfigSpecifier,
} from "#project/tsconfig/index";
import { importPrefix } from "#tools/typescript/constants";
import { readTypescriptLanguage } from "#tools/typescript/operations/readTypescriptLanguage";
import { createBundledImport } from "#tools/typescript/utils/createBundledImport";
import { listSubpathImports } from "#tools/typescript/utils/listSubpathImports";
import type { Alias } from "#batiment/structure/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

const importsPart = "package.json#imports";

const pathsPart = "tsconfig#paths";

type ImportTarget =
  | string
  | null
  | readonly ImportTarget[]
  | { readonly [condition: string]: ImportTarget };

const importTargetSchema: GenericSchema<ImportTarget> = lazy(() => {
  return union([
    string(),
    null_(),
    array(importTargetSchema),
    recordOf(string(), importTargetSchema),
  ]);
});

const importsSchema = optional(recordOf(string(), importTargetSchema));

function sortByKey<Item extends readonly [string, unknown]>(items: Item[]) {
  return sort(items, ([a], [b]) => {
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

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

function mergeGenerated<Value extends JsonValue>(
  file: File,
  current: Readonly<Record<string, Value>>,
  generated: Readonly<Record<string, Value>>,
  recorded: readonly string[] | undefined,
  matches: (current: Value, generated: Value) => boolean,
): Record<string, Value> {
  const previous = (
    recorded ??
    keys(current).filter((key) => {
      return hasOwn(generated, key) && matches(current[key], generated[key]);
    })
  );

  const hand = entries(current).filter(([key]) => !previous.includes(key));

  for (const [key, value] of hand) {
    if (hasOwn(generated, key) && !isDeepStrictEqual(value, generated[key])) {
      throw new Error(
        `${file}: hand-declared ${key} → ${JSON.stringify(value)} collides with the generated ${key} → ${JSON.stringify(generated[key])}; rename it`,
      );
    }
  }

  const kept = hand.filter(([key]) => !hasOwn(generated, key));

  return record(sortByKey([...kept, ...entries(generated)]));
}

async function syncImports(
  config: LoadedConfig,
  imports: Readonly<Record<string, ImportTarget>>,
) {
  const recorded = await readGeneratedKeys(config, importsPart);

  await syncFiles(
    {
      filesystem: config.context.filesystem,
      resolve: config.context.path,
    },
    [
      {
        file: packageJsonFile,
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

  await writeGeneratedKeys(config, importsPart, keys(imports));
}

async function syncPaths(config: LoadedConfig, aliases: readonly Alias[]) {
  const typescript = await config.resolve("typescript");

  const { file } = typescript.tsconfig;
  const filesystem = config.context.filesystem;

  const generated = record(
    map(aliases, ({ key, target }) => {
      return [key, [toTsconfigSpecifier(file, target)]] as const;
    }),
  );

  const current = await readTsconfigPaths(config, file);

  const paths = mergeGenerated(
    file,
    current,
    generated,
    await readGeneratedKeys(config, pathsPart),
    isDeepStrictEqual,
  );

  if (keys(paths).length > 0 || keys(current).length > 0) {
    await filesystem.write(
      file,
      applyJsonEdits(
        (await filesystem.read(file)) ?? emptyObjectFile,
        file,
        [
          {
            path: ["compilerOptions", "paths"],
            value: paths,
          },
        ],
        jsonIndentation,
      ),
    );
  }

  await writeGeneratedKeys(config, pathsPart, keys(generated));
}

// @debt Recovers the stem by stripping the language's first extension from a target the alias resolver built; an `Alias` carrying its stem would remove that coupling.
function toBundledImport(
  { key, target }: Alias,
  extensions: readonly string[],
): ImportTarget {
  const [extension] = extensions;

  if (extension === undefined || !target.endsWith(extension)) {
    throw new Error(
      `The generated alias ${key} → ${target} targets no ${extension} module`,
    );
  }

  return createBundledImport(target.slice(0, -extension.length), extensions);
}

export async function syncAliases(config: LoadedConfig) {
  const { enabled, global, src } = await config.resolve("aliases");

  if (!enabled) {
    return;
  }

  const { bundled, aliases } = await config.resolve("src.options");

  const generated = bundled
    ? src.filter(({ key }) => {
        return key.startsWith(importPrefix) && !hasOwn(aliases.define, key);
      })
    : [];

  const { extensions } = await readTypescriptLanguage(config);

  const imports = {
    ...listSubpathImports([...global, ...src]),
    ...record(
      map(generated, (alias) => {
        return [alias.key, toBundledImport(alias, extensions)] as const;
      }),
    ),
  };

  await syncImports(config, imports);

  if (bundled) {
    await syncPaths(
      config,
      src.filter(({ key }) => !key.startsWith(importPrefix)),
    );
  }
}
