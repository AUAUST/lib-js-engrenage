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
import { listSubpathImports } from "#tools/typescript/utils/listSubpathImports";
import type { LoadedConfig } from "#project/config/index";
import type { Alias } from "#project/structure/index";
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

function mergeGenerated<Value extends JsonValue>(
  file: File,
  current: Readonly<Record<string, Value>>,
  generated: Readonly<Record<string, Value>>,
  recorded: readonly string[] | undefined,
): Record<string, Value> {
  const previous = (
    recorded ??
    keys(current).filter((key) => {
      return isDeepStrictEqual(current[key], generated[key]);
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

async function syncImports(config: LoadedConfig, aliases: readonly Alias[]) {
  const imports = listSubpathImports(aliases);

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

  const paths = mergeGenerated(
    file,
    await readTsconfigPaths(config, file),
    generated,
    await readGeneratedKeys(config, pathsPart),
  );

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

  await writeGeneratedKeys(config, pathsPart, keys(generated));
}

export async function syncAliases(config: LoadedConfig) {
  const { enabled, global, src } = await config.resolve("aliases");

  if (!enabled) {
    return;
  }

  await syncImports(config, [...global, ...src]);

  const source = await config.resolve("src");

  if (source.bundled) {
    await syncPaths(config, src);
  }
}
