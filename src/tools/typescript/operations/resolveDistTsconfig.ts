import { listTsconfigTargets } from "#tools/typescript/operations/listTsconfigTargets";
import type { LoadedConfig } from "#project/config/index";
import type { File } from "#types/File";

/**
 * Resolves the path of the dist tsconfig sync writes for the active root tests
 * environment instance; `undefined` when the config disables it. Fails when the
 * instance is inactive or sync has not created the file yet.
 */
export async function resolveDistTsconfig(
  config: LoadedConfig,
): Promise<File | undefined> {
  const tests = await config.resolve("tests");

  const { tsconfig } = tests.dist;

  if (tsconfig.file === undefined) {
    return;
  }

  const targets = await listTsconfigTargets(config);

  if (!targets.some(({ key }) => key === "tests.dist")) {
    throw new Error(
      "The tests environment is inactive at the project root, so it has no dist variant",
    );
  }

  const path = await tsconfig.path;

  if (path === undefined) {
    throw new Error(
      `The dist tsconfig ${tsconfig.file} does not exist in ${config.context.root}, run \`engrenage sync\` to create it`,
    );
  }

  return path;
}
