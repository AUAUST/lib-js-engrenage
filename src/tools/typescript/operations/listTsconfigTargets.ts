import { rootScope } from "#batiment/scopes/constants";
import { resolveEnvironmentTsconfig } from "#project/environments/index";
import { listInstanceTsconfigs } from "#tools/typescript/operations/listInstanceTsconfigs";
import { toTsconfigEnvironment } from "#tools/typescript/utils/toTsconfigEnvironment";
import type { EnvironmentInstance } from "#batiment/environments/index";
import type { ConfigResolver } from "#project/config/index";
import type {
  ResolvedEnvironmentTsconfig,
  TsconfigKey,
  TsconfigTarget,
} from "#project/tsconfig/index";
import type { File } from "#types/File";

function toTarget(
  key: TsconfigKey,
  instance: EnvironmentInstance,
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
    scope: instance.scope,
    file,
    instance,
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

  const instances = await listInstanceTsconfigs(config);

  for (const { instance, tsconfig, file } of instances) {
    if (file !== undefined) {
      targets.push(toTarget(instance.environment, instance, file, tsconfig));
    }
  }

  const tests = instances.find(({ instance }) => {
    return (
      instance.environment === toTsconfigEnvironment("tests.dist") &&
      instance.scope === rootScope
    );
  })?.instance;

  if (tests === undefined) {
    return targets;
  }

  const dist = await resolveEnvironmentTsconfig(config, "tests.dist");

  if (dist.file !== undefined) {
    targets.push(toTarget("tests.dist", tests, dist.file, dist));
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
      instance: undefined,
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
