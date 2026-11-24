import { map } from "@auaust/toolkit/array";

import { listStaticFileGlobs } from "#batiment/roles/index";
import { rootScope } from "#batiment/scopes/constants";
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
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveSourceDeclarationsFile } from "#tools/typescript/operations/resolveSourceDeclarationsFile";
import { toTsconfigEnvironment } from "#tools/typescript/utils/toTsconfigEnvironment";
import { toTsconfigOptionPath } from "#tools/typescript/utils/toTsconfigOptionPath";
import type { EnvironmentInstance } from "#batiment/environments/index";
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
  name: string,
): Promise<readonly File[]> {
  const { namespaces } = await config.resolve("importGrants");

  const forbidden = namespaces[name];

  if (
    name === "src" ||
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
  { environment: name, scope, dirs, files: matched }: EnvironmentInstance,
): Promise<readonly string[]> {
  const context = await config.resolve("structure.context");

  const { environments } = await context.discover();

  const registered = environments.registered.find(({ registration }) => {
    return registration.name === name;
  });

  if (registered === undefined) {
    throw new Error(
      `The tsconfig of the ${name} environment includes its placements, yet no environment named ${name} is registered`,
    );
  }

  const languages = await readEnvironmentLanguages(config, name);

  // @debt file placements enter a root tsconfig's `include` as their registration's globs, a file another environment's placement keeps included too, since listing the matched files would rewrite every generated tsconfig; a workspace tsconfig lists its matched files instead, as globs matched at the project root would reach outside its scope
  const files = scope === rootScope ? registered.registration.files : matched;

  return [...files, ...filesIn(dirs, listLanguageFiles(languages))];
}

async function createDefaultInclude(
  config: LoadedConfig,
  { key, file, instance }: TsconfigTarget,
): Promise<() => readonly string[]> {
  const name = toTsconfigEnvironment(key);

  if (instance === undefined) {
    throw new Error(
      `The ${key} tsconfig includes its environment's placements, yet it checks no environment instance`,
    );
  }

  const globs = await listEnvironmentGlobs(config, instance);

  const declarations = [
    ...(await listGlobalDeclarations(config)),
    ...(await listSourceDeclarations(config, name)),
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

    // @debt includes the tests namespace's dirs while the target exists for the root tests environment instance, whose placements an `.environment.json` can move elsewhere
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
  target: TsconfigTarget,
): Promise<readonly JsonEdit[]> {
  const { key, file, include: option } = target;

  if (key === "base") {
    return [];
  }

  const include = resolveListOption(
    option,
    key === "tests.dist"
      ? await createDistTestsInclude(config, file)
      : await createDefaultInclude(config, target),
    `${toTsconfigOptionPath(key)}.include`,
    config.context.reporter,
  );

  return include === false ? [] : [{ path: ["include"], value: [...include] }];
}
