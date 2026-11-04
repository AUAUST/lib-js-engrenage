import { resolve } from "node:path";

import { emptyObjectFile } from "#json/constants";
import { applyJsonEdits } from "#json/utils/applyJsonEdits";
import { produceTsconfigExtends } from "#tsconfig/setup/produceTsconfigExtends";
import { createTsconfig } from "#tsconfig/utils/createTsconfig";
import { toTsconfigSpecifier } from "#tsconfig/utils/toTsconfigSpecifier";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { JsonEdit } from "#json/types/JsonEdit";
import type { TsconfigTarget } from "#tsconfig/types/TsconfigTarget";
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
