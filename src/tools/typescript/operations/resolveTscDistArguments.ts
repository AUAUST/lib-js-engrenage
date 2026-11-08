import { testsSection } from "#project/environments/index";
import { resolveTscProjectArguments } from "#tools/typescript/operations/resolveTscProjectArguments";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

async function resolveDistProject(config: LoadedConfig): Promise<File> {
  const tests = await config.resolve(testsSection);

  const { owner, file } = tests.dist.tsconfig;

  const path = await tests.dist.tsconfig.path;

  if (!tests.active) {
    throw new Error(
      "The tests environment is inactive, so it has no dist variant",
    );
  }

  if (owner === undefined || file === undefined) {
    throw new Error(
      "The dist tsconfig is disabled in the engrenage config (tests.dist.tsconfig: false)",
    );
  }

  if (path === undefined) {
    throw new Error(
      `The dist tsconfig ${file} does not exist in ${config.context.root}, run \`engrenage sync\` to create it`,
    );
  }

  return path;
}

export async function resolveTscDistArguments(
  config: LoadedConfig,
  args: readonly string[],
): Promise<string[]> {
  return resolveTscProjectArguments(
    config,
    args,
    await resolveDistProject(config),
  );
}
