import { isDeepStrictEqual } from "node:util";

import { map } from "@auaust/toolkit/array";
import { getOwn, hasOwn, keys, record } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits } from "#foundation/json/index";
import { readEnvironmentLanguages } from "#project/environments/index";
import { jsonIndentation } from "#project/format/constants";
import { readGeneratedKeys, writeGeneratedKeys } from "#project/sync/index";
import {
  readTsconfigPaths,
  toTsconfigSpecifier,
} from "#project/tsconfig/index";
import { importPrefix, typescript } from "#tools/typescript/constants";
import { syncImports } from "#tools/typescript/operations/syncImports";
import { createBundledImport } from "#tools/typescript/utils/createBundledImport";
import { listSubpathImports } from "#tools/typescript/utils/listSubpathImports";
import { mergeGenerated } from "#tools/typescript/utils/mergeGenerated";
import type { Alias } from "#batiment/structure/index";
import type { LoadedConfig } from "#project/config/index";
import type { ImportTarget } from "#tools/typescript/types/ImportTarget";

const pathsPart = "tsconfig#paths";

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

async function readSourceExtensions(
  config: LoadedConfig,
  needed: boolean,
): Promise<readonly string[]> {
  if (!needed) {
    return [];
  }

  const languages = await readEnvironmentLanguages(config, "src");

  return languages.find(({ name }) => name === typescript)?.extensions ?? [];
}

export async function syncAliases(config: LoadedConfig) {
  const { enabled, global, src } = await config.resolve("aliases");

  if (!enabled) {
    return;
  }

  const [{ aliases }, execution] = await Promise.all([
    config.resolve("src.options"),
    config.resolve("environments.execution"),
  ]);

  const bundled = getOwn(execution, "src")?.bundled ?? false;

  const generated = bundled
    ? src.filter(({ key }) => {
        return key.startsWith(importPrefix) && !hasOwn(aliases.define, key);
      })
    : [];

  const extensions = await readSourceExtensions(config, generated.length > 0);

  const imports = {
    ...listSubpathImports([...global, ...src]),
    ...record(
      map(generated, (alias) => {
        return [alias.key, toBundledImport(alias, extensions)] as const;
      }),
    ),
  };

  await syncImports(config, packageJsonFile, imports);

  if (bundled) {
    await syncPaths(
      config,
      src.filter(({ key }) => !key.startsWith(importPrefix)),
    );
  }
}
