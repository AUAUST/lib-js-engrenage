import { withExtensions } from "#foundation/filesystem/index";
import { hasOption } from "#foundation/processes/index";
import {
  everyTypescriptExtension,
  tscBuildOptions,
  tscProjectOptions,
} from "#tools/typescript/constants";
import { holdsInstanceFile } from "#tools/typescript/operations/holdsInstanceFile";
import { listActiveInstances } from "#tools/typescript/operations/listActiveInstances";
import { partitionInstanceTsconfigs } from "#tools/typescript/operations/partitionInstanceTsconfigs";
import { resolveTscProjectArguments } from "#tools/typescript/operations/resolveTscProjectArguments";
import { describeSkippedInstance } from "#tools/typescript/utils/describeSkippedInstance";
import type { LoadedConfig } from "#project/config/index";

async function listUnconfiguredInstances(
  config: LoadedConfig,
): Promise<readonly string[]> {
  const { placements, instances } = await listActiveInstances(config);

  const described = await Promise.all(
    instances
      .filter(({ tsconfig }) => !tsconfig)
      .map(async ({ instance }) => {
        const holdsTypescript = (
          instance.files.some((file) => {
            return everyTypescriptExtension.some((extension) => {
              return file.endsWith(extension);
            });
          }) ||
          (await holdsInstanceFile({
            config,
            placements,
            instance,
            files: [withExtensions("**/*", everyTypescriptExtension)],
          }))
        );

        return holdsTypescript
          ? [describeSkippedInstance(instance, "no tsconfig")]
          : [];
      }),
  );

  return described.flat();
}

async function listSkippedTsconfigs(
  config: LoadedConfig,
): Promise<readonly string[]> {
  const [{ checked, skipped }, unconfigured] = await Promise.all([
    partitionInstanceTsconfigs(config),
    listUnconfiguredInstances(config),
  ]);

  const unchecked = [...skipped, ...unconfigured];

  if (checked.length > 0) {
    return unchecked;
  }

  throw new Error(
    unchecked.length === 0
      ? "No environment is type-checked: none holds a file in its languages"
      : `No environment is type-checked: ${unchecked.join(", ")}`,
  );
}

/**
 * The arguments of each `tsc` run checking an instance tsconfig the base tsconfig
 * references, with a description of each instance it skips, those holding
 * TypeScript files without a tsconfig included; `args` naming a project run
 * alone, as given, skipping none.
 *
 * @throws When `args` name no project and no instance tsconfig is checked.
 */
export async function resolveTscArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<{
  runs: string[][];
  skipped: readonly string[];
}> {
  const skipped = hasOption(args, [...tscBuildOptions, ...tscProjectOptions])
    ? []
    : await listSkippedTsconfigs(config);

  return {
    runs: await resolveTscProjectArguments(
      config,
      args,
      await config.resolve("tsconfigPath"),
    ),
    skipped,
  };
}
