import { resolve } from "node:path";

import { emptyObjectFile } from "#support/json/constants";
import { applyJsonEdits } from "#support/json/utils/applyJsonEdits";
import { produceTsconfigExtends } from "#typescript/setup/produceTsconfigExtends";
import { createTsconfig } from "#typescript/utils/createTsconfig";
import { toTsconfigSpecifier } from "#typescript/utils/toTsconfigSpecifier";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#support/json/types/JsonEdit";
import type { Directory } from "#types/Directory";
import type { TsconfigTarget } from "#typescript/types/TsconfigTarget";

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
