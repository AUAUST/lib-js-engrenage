import { map, sort } from "@auaust/primitive-kit/arrays";
import { entries, keys, record } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { syncFiles } from "#foundation/blocks/operations/syncFiles";
import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits } from "#foundation/json/utils/applyJsonEdits";
import { readJsonValue } from "#foundation/json/utils/readJsonValue";
import { jsonIndentation } from "#project/format/constants";
import { writePackageJsonValue } from "#project/package/operations/writePackageJsonValue";
import { readTsconfigPaths } from "#project/tsconfig/utils/readTsconfigPaths";
import { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { Alias } from "#project/structure/types/Alias";

const importPrefix = "#";

function sortByKey<Item extends readonly [string, unknown]>(items: Item[]) {
  return sort(items, ([a], [b]) => {
    return a < b ? -1 : a > b ? 1 : 0;
  });
}

function syncImports(config: ProjectConfig, aliases: readonly Alias[]) {
  const imports = record(
    sortByKey(
      aliases
        .filter(({ key }) => key.startsWith(importPrefix))
        .map(({ key, target }) => [key, target] as const),
    ),
  );

  syncFiles(config, [
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

function syncPaths(config: ProjectConfig, aliases: readonly Alias[]) {
  const { file } = config.typescript.tsconfig;

  const others = entries(readTsconfigPaths(config, file)).filter(([key]) => {
    return !key.startsWith(importPrefix);
  });

  const generated = map(aliases, ({ key, target }) => {
    return [key, [toTsconfigSpecifier(file, target)]] as const;
  });

  config.filesystem.write(
    file,
    applyJsonEdits(
      config.filesystem.read(file) ?? emptyObjectFile,
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

export function syncAliases(config: ProjectConfig) {
  const { enabled, global, src } = config.aliases;

  if (!enabled) {
    return;
  }

  syncImports(config, [...global, ...src]);

  if (config.src.bundled) {
    // @debt bundler aliases removed from the config stay in the tsconfig `paths`, since only `#` keys are known to be generated
    syncPaths(config, src);
  }
}
