import { map } from "@auaust/toolkit/array";
import { entries } from "@auaust/toolkit/object";

import { listStaticFileGlobs } from "#batiment/roles/index";
import { filesIn } from "#foundation/filesystem/index";
import { resolveListOption } from "#foundation/options/index";
import {
  listLanguageFiles,
  readEnvironmentLanguages,
} from "#project/environments/index";
import { declarations, testsetup } from "#project/roles/index";
import {
  globalDeclarationsFile,
  toTsconfigGlobs,
  type TsconfigKey,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveSourceDeclarationsFile } from "#tools/typescript/operations/resolveSourceDeclarationsFile";
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
  const { namespaces } = await config.resolve("importGrants");

  const forbidden = namespaces[owner];

  if (
    owner === "src" ||
    forbidden === undefined ||
    forbidden.includes("internal-aliases")
  ) {
    return [];
  }

  const declarations = await resolveSourceDeclarationsFile(config);

  return declarations !== undefined &&
    (await config.context.filesystem.exists(declarations))
    ? [declarations]
    : [];
}

async function listEnvironmentGlobs(
  config: LoadedConfig,
  names: readonly string[],
): Promise<readonly string[]> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const placed = entries(environments.placements.dirs);

  const globs = await Promise.all(
    names.map(async (name) => {
      const registered = environments.registered.find(({ registration }) => {
        return registration.name === name;
      });

      if (registered === undefined) {
        throw new Error(
          `The tsconfig of the ${name} environment includes its placements, yet no environment named ${name} is registered`,
        );
      }

      const languages = await readEnvironmentLanguages(config, name);

      const dirs = placed
        .filter(([, environment]) => environment === name)
        .map(([dir]) => dir);

      // @debt file placements enter `include` as their registration's globs, a file another environment's placement keeps included too, since listing the matched files would rewrite every generated tsconfig
      return [
        ...registered.registration.files,
        ...filesIn(dirs, listLanguageFiles(languages)),
      ];
    }),
  );

  return globs.flat();
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

  const globs = await listEnvironmentGlobs(config, environments);

  const declarations = [
    ...(await listGlobalDeclarations(config)),
    ...(await listSourceDeclarations(config, owner)),
  ];

  return () => toTsconfigGlobs(file, [...globs, ...declarations]);
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
