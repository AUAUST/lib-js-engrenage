import { listTsconfigEnvironments } from "#tools/typescript/operations/listTsconfigEnvironments";
import { resolveTsconfigEnvironment } from "#tools/typescript/operations/resolveTsconfigEnvironment";
import type { ConfigResolver } from "#project/config/index";
import type {
  ResolvedEnvironmentTsconfig,
  TsconfigKey,
  TsconfigTarget,
} from "#project/tsconfig/index";

function toTarget(
  key: TsconfigKey,
  {
    file,
    extends: extended,
    include,
    exclude,
    lib,
    types,
    compilerOptions,
    unmanaged,
  }: ResolvedEnvironmentTsconfig,
): TsconfigTarget | undefined {
  return file === undefined
    ? undefined
    : {
        key,
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

// @debt "tests.dist" does not fit the config shape, so it is special-cased here and in createResolvedConfig, resolveTsconfigEnvironments and the extends, include, paths and skipLibCheck producers; a single lookup from tsconfig key to its environment would remove the branches
async function isActive(
  config: ConfigResolver,
  key: TsconfigKey,
): Promise<boolean> {
  const { active } = await resolveTsconfigEnvironment(
    config,
    key === "tests.dist" ? "tests" : key,
  );

  return active;
}

async function findTsconfig(config: ConfigResolver, key: TsconfigKey) {
  if (key === "tests.dist") {
    const { dist } = await config.resolve("tests");

    return dist.tsconfig;
  }

  const { tsconfig } = await resolveTsconfigEnvironment(config, key);

  return tsconfig;
}

export async function listTsconfigTargets(
  config: ConfigResolver,
): Promise<TsconfigTarget[]> {
  const { tsconfig } = await config.resolve("typescript");

  const targets: TsconfigTarget[] = [
    {
      key: "base",
      file: tsconfig.file,
      extends: tsconfig.extends,
      include: undefined,
      exclude: undefined,
      lib: undefined,
      types: undefined,
      compilerOptions: tsconfig.compilerOptions,
      unmanaged: tsconfig.unmanaged,
    },
  ];

  const variantKeys: readonly TsconfigKey[] = [
    ...(await listTsconfigEnvironments(config)),
    "tests.dist",
  ];

  for (const key of variantKeys) {
    const resolved = await findTsconfig(config, key);

    if (resolved.owner !== key || !(await isActive(config, key))) {
      continue;
    }

    const target = toTarget(key, resolved);

    if (target !== undefined) {
      targets.push(target);
    }
  }

  return targets;
}
