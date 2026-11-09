import { resolve } from "node:path";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits, type JsonEdit } from "#foundation/json/index";
import { jsonIndentation } from "#project/format/constants";
import {
  createTsconfig,
  toTsconfigSpecifier,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { produceTsconfigExtends } from "#tools/typescript/operations/produceTsconfigExtends";
import type { LoadedConfig } from "#project/config/index";
import type { Directory } from "#types/Directory";

const outDirLocation = ["compilerOptions", "outDir"];

async function resolveInheritedOutDir(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<Directory | undefined> {
  const { root, filesystem, path: resolvePath } = config.context;

  const path = resolvePath(target.file);

  const content = applyJsonEdits(
    (await filesystem.read(path)) ?? emptyObjectFile,
    target.file,
    [
      ...(await produceTsconfigExtends(config, target)),
      { path: outDirLocation, value: undefined },
    ],
    jsonIndentation,
  );

  const tsconfig = await createTsconfig({
    root,
    path,
    filesystem,
    content,
  });

  return tsconfig.optional.compilerOptions?.outDir;
}

export async function produceTsconfigOutDir(
  config: LoadedConfig,
  target: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  const { configuredOutDir: outDir } = await config.resolve("build");

  if (target.key !== "src" || outDir === undefined) {
    return [];
  }

  const inherited = await resolveInheritedOutDir(config, target);

  const resolvePath = config.context.path;

  if (inherited !== undefined && resolve(inherited) === resolvePath(outDir)) {
    return [];
  }

  return [
    {
      path: outDirLocation,
      value: toTsconfigSpecifier(target.file, outDir),
    },
  ];
}
