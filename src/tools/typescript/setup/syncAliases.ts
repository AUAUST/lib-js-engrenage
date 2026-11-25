import { posix } from "node:path";
import { isDeepStrictEqual } from "node:util";

import { map } from "@auaust/toolkit/array";
import { getOwn, hasOwn, keys, record } from "@auaust/toolkit/object";

import { packageJsonFile } from "#constants";
import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits } from "#foundation/json/index";
import {
  createLanguageExtensions,
  findFileExtension,
  type LanguageExtensions,
} from "#project/environments/index";
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

// @debt Recovers the stem by stripping the extension of its environment's language from a target the alias resolver built; an `Alias` carrying its stem would remove that coupling.
// @debt Looks a wildcard target up as a file, so it takes its directory's environment and ignores the file placements below that directory, which one wildcard target cannot follow.
function toBundledImport(
  { key, target }: Alias,
  extensionsOf: LanguageExtensions,
): ImportTarget {
  const extensions = extensionsOf(posix.normalize(target));

  const extension = findFileExtension(target, extensions);

  if (extension === undefined) {
    throw new Error(
      `The generated alias ${key} → ${target} targets no module of ${extensions.join(", ")}`,
    );
  }

  return createBundledImport(target.slice(0, -extension.length), extensions);
}

async function listBundledImports(
  config: LoadedConfig,
  aliases: readonly Alias[],
): Promise<Record<string, ImportTarget>> {
  if (aliases.length === 0) {
    return {};
  }

  const extensionsOf = await createLanguageExtensions(config, typescript);

  return record(
    map(aliases, (alias) => {
      return [alias.key, toBundledImport(alias, extensionsOf)] as const;
    }),
  );
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

  // @debt Reads `bundled` from the src environment alone, though the namespace's other directories may lie in environments bundled otherwise.
  const bundled = getOwn(execution, "src")?.bundled ?? false;

  const generated = bundled
    ? src.filter(({ key }) => {
        return key.startsWith(importPrefix) && !hasOwn(aliases.define, key);
      })
    : [];

  const imports = {
    ...listSubpathImports([...global, ...src]),
    ...(await listBundledImports(config, generated)),
  };

  await syncImports(config, packageJsonFile, imports);

  if (bundled) {
    await syncPaths(
      config,
      src.filter(({ key }) => !key.startsWith(importPrefix)),
    );
  }
}
