import { flatMap, map } from "@auaust/toolkit/array";

import { filesIn } from "#foundation/filesystem/index";
import { resolveListOption } from "#foundation/options/index";
import { declarations, testsetup } from "#project/roles/index";
import { listStaticFileGlobs } from "#project/structure/index";
import {
  globalDeclarationsFile,
  toTsconfigGlobs,
  type TsconfigKey,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveSourceDeclarationsFile } from "#tools/typescript/operations/resolveSourceDeclarationsFile";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import { resolveTsconfigEnvironments } from "#tools/typescript/operations/resolveTsconfigEnvironments";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

async function listGlobalDeclarations(
  config: LoadedConfig,
): Promise<readonly File[]> {
  const exists = await config.context.filesystem.exists(globalDeclarationsFile);

  return exists ? [globalDeclarationsFile] : [];
}

async function listSourceDeclarations(
  config: LoadedConfig,
  owner: string,
): Promise<readonly File[]> {
  const { consumers } = await config.resolve("importGrants");

  if (owner !== "tests" && !consumers.includes(owner)) {
    return [];
  }

  const declarations = await resolveSourceDeclarationsFile(config);

  return declarations !== undefined &&
    (await config.context.filesystem.exists(declarations))
    ? [declarations]
    : [];
}

async function createDefaultInclude(
  config: LoadedConfig,
  key: TsconfigKey,
  file: File,
): Promise<() => readonly string[]> {
  const {
    owner,
    environments,
  } = await resolveTsconfigEnvironments(config, key);

  const resolved = await Promise.all(
    environments.map((name) => resolveTsconfigEnvironment(config, name)),
  );

  const declarations = [
    ...(await listGlobalDeclarations(config)),
    ...(await listSourceDeclarations(config, owner)),
  ];

  return () => {
    const globs = flatMap(resolved, ({ globs }) => globs);

    return toTsconfigGlobs(file, [...globs, ...declarations]);
  };
}

async function createDistTestsInclude(
  config: LoadedConfig,
  file: File,
): Promise<() => readonly string[]> {
  const tests = await config.resolve("tests");

  const roles = await config.resolve("environmentRoles");

  const globalDeclarations = await listGlobalDeclarations(config);

  return () => {
    const { plain, dist } = tests.patterns;

    const testRoles = roles.tests?.roles;

    const setupFiles = listStaticFileGlobs(testRoles?.[testsetup().name]?.file);

    const declarationFiles = map(
      listStaticFileGlobs(testRoles?.[declarations().name]?.file),
      (glob) => `**/${glob}`,
    );

    const globs = filesIn(tests.dirs, [
      ...plain,
      ...dist,
      ...setupFiles,
      ...declarationFiles,
    ]);

    return toTsconfigGlobs(file, [...globs, ...globalDeclarations]);
  };
}

export async function produceTsconfigInclude(
  config: LoadedConfig,
  { key, file, include: option }: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  if (key === "base") {
    return [];
  }

  const include = resolveListOption(
    option,
    key === "tests.dist"
      ? await createDistTestsInclude(config, file)
      : await createDefaultInclude(config, key, file),
    `${key}.tsconfig.include`,
    config.context.reporter,
  );

  return include === false ? [] : [{ path: ["include"], value: [...include] }];
}
