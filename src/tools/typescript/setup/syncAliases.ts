import { map, sort } from "@auaust/primitive-kit/arrays";
import { entries, keys, record } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/index";
import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits, readJsonValue } from "#foundation/json/index";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/index";
import {
  readTsconfigPaths,
  toTsconfigSpecifier,
} from "#project/tsconfig/index";
import type { Filesystem } from "#foundation/filesystem/index";
import type { LoadedConfig } from "#project/config/index";
import type { Alias } from "#project/structure/index";

const importPrefix = "#";

function sortByKey<Item extends readonly [string, unknown]>(items: Item[]) {
  return sort(items, ([a], [b]) => {
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

async function syncImports(
  config: {
    filesystem: Filesystem;
    resolve(...paths: string[]): string;
  },
  aliases: readonly Alias[],
) {
  const imports = record(
    sortByKey(
      aliases
        .filter(({ key }) => key.startsWith(importPrefix))
        .map(({ key, target }) => [key, target] as const),
    ),
  );

  await syncFiles(config, [
    {
      file: packageJsonFile,
      update(content, path) {
        if (
          keys(imports).length === 0 &&
          readJsonValue(content, path, ["imports"]) === undefined
        ) {
          return content;
        }

        return writePackageJsonValue(
          content,
          path,
          ["imports"],
          imports,
          jsonIndentation,
        );
      },
    },
  ]);
}

async function syncPaths(config: LoadedConfig, aliases: readonly Alias[]) {
  const typescript = await config.resolve("typescript");

  const { file } = typescript.tsconfig;
  const filesystem = config.context.filesystem;

  const others = entries(await readTsconfigPaths(config, file)).filter(
    ([key]) => {
      return !key.startsWith(importPrefix);
    },
  );

  const generated = map(aliases, ({ key, target }) => {
    return [key, [toTsconfigSpecifier(file, target)]] as const;
  });

  await filesystem.write(
    file,
    applyJsonEdits(
      (await filesystem.read(file)) ?? emptyObjectFile,
      file,
      [
        {
          path: ["compilerOptions", "paths"],
          value: record([...others, ...sortByKey(generated)]),
        },
      ],
      jsonIndentation,
    ),
  );
}

export async function syncAliases(config: LoadedConfig) {
  const { enabled, global, src } = await config.resolve("aliases");

  if (!enabled) {
    return;
  }

  await syncImports(
    {
      filesystem: config.context.filesystem,
      resolve: config.context.path,
    },
    [...global, ...src],
  );

  const source = await config.resolve("src");

  if (source.bundled) {
    // @debt bundler aliases removed from the config stay in the tsconfig `paths`, since only `#` keys are known to be generated
    await syncPaths(config, src);
  }
}
