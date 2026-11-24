import { rootScope } from "#batiment/scopes/constants";
import { resolveEnvironmentTsconfig } from "#project/environments/index";
import { listInstanceTsconfigs } from "#tools/typescript/operations/listInstanceTsconfigs";
import type { ConfigResolver } from "#project/config/index";
import type {
  ResolvedEnvironmentTsconfig,
  TsconfigKey,
  TsconfigTarget,
} from "#project/tsconfig/index";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

function toTarget(
  key: TsconfigKey,
  scope: Directory,
  file: File,
  {
    extends: extended,
    include,
    exclude,
    lib,
    types,
    compilerOptions,
    unmanaged,
  }: ResolvedEnvironmentTsconfig,
): TsconfigTarget {
  return {
    key,
    scope,
    file,
    extends: extended,
    include,
    exclude,
    lib,
    types,
    compilerOptions,
    unmanaged,
  };
}

async function listEnvironmentTargets(
  config: ConfigResolver,
): Promise<readonly TsconfigTarget[]> {
  const targets: TsconfigTarget[] = [];

  for (const { instance, tsconfig, file } of await listInstanceTsconfigs(
    config,
  )) {
    if (file !== undefined) {
      targets.push(
        toTarget(instance.environment, instance.scope, file, tsconfig),
      );
    }
  }

  const { active } = await config.resolve("tests");

  if (!active) {
    return targets;
  }

  const dist = await resolveEnvironmentTsconfig(config, "tests.dist");

  if (dist.file !== undefined) {
    targets.push(toTarget("tests.dist", rootScope, dist.file, dist));
  }

  return targets;
}

function describeTarget({ key, scope }: TsconfigTarget): string {
  if (key === "base") {
    return "the base tsconfig";
  }

  return scope === rootScope
    ? `the ${key} tsconfig`
    : `the ${key} tsconfig in ${scope}`;
}

function assertDistinctFiles(targets: readonly TsconfigTarget[]) {
  const byFile = new Map<File, TsconfigTarget>();

  for (const target of targets) {
    const other = byFile.get(target.file);

    if (other !== undefined) {
      throw new Error(
        `${describeTarget(other)} and ${describeTarget(target)} both resolve to ${target.file}: set another path on one of them`,
      );
    }

    byFile.set(target.file, target);
  }
}

export async function listTsconfigTargets(
  config: ConfigResolver,
): Promise<TsconfigTarget[]> {
  const { tsconfig } = await config.resolve("typescript");

  const targets: TsconfigTarget[] = [
    {
      key: "base",
      scope: rootScope,
      file: tsconfig.file,
      extends: tsconfig.extends,
      include: undefined,
      exclude: undefined,
      lib: undefined,
      types: undefined,
      compilerOptions: tsconfig.compilerOptions,
      unmanaged: tsconfig.unmanaged,
    },
    ...(await listEnvironmentTargets(config)),
  ];

  assertDistinctFiles(targets);

  return targets;
}
