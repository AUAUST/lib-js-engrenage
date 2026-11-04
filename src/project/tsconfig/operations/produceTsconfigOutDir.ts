import { resolve } from "node:path";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits } from "#foundation/json/utils/applyJsonEdits";
import { jsonIndentation } from "#project/format/constants";
import { createTsconfig } from "#project/tsconfig/operations/createTsconfig";
import { produceTsconfigExtends } from "#project/tsconfig/operations/produceTsconfigExtends";
import { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ResolvedConfig } from "#project/config/types/ResolvedConfig";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";
import type { Directory } from "#types/Directory";

const outDirLocation = ["compilerOptions", "outDir"];

function resolveInheritedOutDir(
  config: ResolvedConfig,
  target: TsconfigTarget,
): Directory | undefined {
  const path = config.resolve(target.file);

  const content = applyJsonEdits(
    config.filesystem.read(path) ?? emptyObjectFile,
    target.file,
    [
      ...produceTsconfigExtends(config, target),
      { path: outDirLocation, value: undefined },
    ],
    jsonIndentation,
  );

  return createTsconfig({
    root: config.root,
    path,
    filesystem: config.filesystem,
    content,
  }).optional.compilerOptions?.outDir;
}

export function produceTsconfigOutDir(
  config: ResolvedConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  const outDir = config.raw.build?.outDir;

  if (target.key !== "src" || outDir === undefined) {
    return [];
  }

  const inherited = resolveInheritedOutDir(config, target);

  if (
    inherited !== undefined &&
    resolve(inherited) === config.resolve(outDir)
  ) {
    return [];
  }

  return [
    {
      path: outDirLocation,
      value: toTsconfigSpecifier(target.file, outDir),
    },
  ];
}
