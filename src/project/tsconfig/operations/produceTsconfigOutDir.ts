import { resolve } from "node:path";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits } from "#foundation/json/utils/applyJsonEdits";
import { validate } from "#foundation/options/utils/validate";
import { buildSchema } from "#project/build/config/schemas/buildSchema";
import { jsonIndentation } from "#project/format/constants";
import { createTsconfig } from "#project/tsconfig/utils/createTsconfig";
import { produceTsconfigExtends } from "#project/tsconfig/utils/produceTsconfigExtends";
import { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
import type { JsonEdit } from "#foundation/json/types/JsonEdit";
import type { ProjectConfig } from "#project/config/types/ProjectConfig";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";
import type { Directory } from "#types/Directory";

const outDirLocation = ["compilerOptions", "outDir"];

function resolveInheritedOutDir(
  config: ProjectConfig,
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
  config: ProjectConfig,
  target: TsconfigTarget,
): readonly JsonEdit[] {
  // @debt the configured output directory is read by validating the raw build section again; the resolved build section could expose it next to its computed default
  const outDir = validate(
    buildSchema.schema,
    config.raw.build,
    "build config",
  )?.outDir;

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
