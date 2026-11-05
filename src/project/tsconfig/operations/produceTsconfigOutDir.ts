import { resolve } from "node:path";

import { emptyObjectFile } from "#foundation/json/constants";
import { applyJsonEdits, type JsonEdit } from "#foundation/json/index";
import { validate } from "#foundation/options/index";
import { buildSchema } from "#project/build/index";
import { jsonIndentation } from "#project/format/constants";
import { createTsconfig } from "#project/tsconfig/operations/createTsconfig";
import { produceTsconfigExtends } from "#project/tsconfig/utils/produceTsconfigExtends";
import { toTsconfigSpecifier } from "#project/tsconfig/utils/toTsconfigSpecifier";
import type { ConfigContext } from "#project/config/index";
import type { TsconfigTarget } from "#project/tsconfig/types/TsconfigTarget";
import type { Directory } from "#types/Directory";

const outDirLocation = ["compilerOptions", "outDir"];

async function resolveInheritedOutDir(
  config: ConfigContext,
  target: TsconfigTarget,
): Promise<Directory | undefined> {
  const [root, filesystem, resolvePath] = await Promise.all([
    config.get("root"),
    config.get("filesystem"),
    config.get("resolve"),
  ]);

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
  config: ConfigContext,
  target: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  const raw = await config.get("raw");

  // @debt the configured output directory is read by validating the raw build section again; the resolved build section could expose it next to its computed default
  const outDir = validate(
    buildSchema.schema,
    raw.build,
    "build config",
  )?.outDir;

  if (target.key !== "src" || outDir === undefined) {
    return [];
  }

  const inherited = await resolveInheritedOutDir(config, target);
  const resolvePath = await config.get("resolve");

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
