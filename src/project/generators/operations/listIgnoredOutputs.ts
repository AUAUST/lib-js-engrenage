import { createGlobMatcher } from "#foundation/filesystem/index";
import { listGenerators } from "#project/generators/operations/listGenerators";
import type { LoadedConfig } from "#project/config/index";
import type { Files } from "#types/Files";

/**
 * The existing files the project's generators write that Git ignores, which
 * no Git tree holds.
 */
export async function listIgnoredOutputs(config: LoadedConfig): Promise<Files> {
  const generators = await listGenerators(config);

  const outputs = generators.flatMap(({ outputs }) => outputs);

  if (outputs.length === 0) {
    return [];
  }

  const { filesystem } = config.context;

  const git = await config.resolve("git");

  const isIgnored = createGlobMatcher(await git.ignored);

  const files = await filesystem.glob(outputs);

  return [...files].filter((file) => isIgnored(file)).sort();
}
