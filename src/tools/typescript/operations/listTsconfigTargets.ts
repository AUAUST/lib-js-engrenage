import { resolveEnvironmentTsconfig } from "#project/environments/index";
import { listTsconfigEnvironments } from "#tools/typescript/operations/listTsconfigEnvironments";
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

async function listVariantKeys(
  config: ConfigResolver,
): Promise<readonly TsconfigKey[]> {
  const names = await listTsconfigEnvironments(config);

  const { active } = await config.resolve("tests");

  return active ? [...names, "tests.dist"] : names;
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

  for (const key of await listVariantKeys(config)) {
    const target = toTarget(key, await resolveEnvironmentTsconfig(config, key));

    if (target !== undefined) {
      targets.push(target);
    }
  }

  return targets;
}
