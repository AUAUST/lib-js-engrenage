import { relative } from "node:path/posix";

import { flatMap } from "@auaust/primitive-kit/arrays";

import { filesIn } from "#foundation/filesystem/index";
import { resolveListOption } from "#foundation/options/index";
import { declarations, testsetup } from "#project/roles/index";
import { listStaticFileGlobs } from "#project/structure/index";
import {
  toTsconfigGlobs,
  type TsconfigKey,
  type TsconfigTarget,
} from "#project/tsconfig/index";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import { resolveTsconfigEnvironments } from "#tools/typescript/operations/resolveTsconfigEnvironments";
import type { JsonEdit } from "#foundation/json/index";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

async function createDefaultInclude(
  config: LoadedConfig,
  key: TsconfigKey,
  file: File,
): Promise<() => readonly string[]> {
  const { owner, environments } = await resolveTsconfigEnvironments(
    config,
    key,
  );

  const resolved = await Promise.all(
    environments.map((name) => resolveTsconfigEnvironment(config, name)),
  );

  const { defines } = await resolveTsconfigEnvironment(config, owner);

  const root = config.context.root;

  const { envFile } = await config.resolve("typescript");

  return () => {
    const globs = flatMap(resolved, ({ globs }) => globs);

    const included = defines ? [...globs, relative(root, envFile)] : globs;

    return toTsconfigGlobs(file, included);
  };
}

async function createDistTestsInclude(
  config: LoadedConfig,
  file: File,
): Promise<() => readonly string[]> {
  const tests = await config.resolve("tests");

  const roles = await config.resolve("environmentRoles");

  const { envFile } = await config.resolve("typescript");

  const root = config.context.root;

  return () => {
    const { plain, dist } = tests.patterns;

    // @debt role files are matched only at the root of the tests directories, as in findSetupFiles, so declarations placed deeper stay out of the dist check
    const roleFiles = flatMap([testsetup(), declarations()], ({ name }) => {
      return listStaticFileGlobs(roles.tests?.roles[name]?.file);
    });

    const globs = filesIn(tests.dirs, [...plain, ...dist, ...roleFiles]);

    const included = tests.defines
      ? [...globs, relative(root, envFile)]
      : globs;

    return toTsconfigGlobs(file, included);
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
  );

  return include === false ? [] : [{ path: ["include"], value: [...include] }];
}
