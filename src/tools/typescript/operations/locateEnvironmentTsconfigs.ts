import { relativeWithin } from "#foundation/filesystem/index";
import { listTsconfigTargets } from "#tools/typescript/operations/listTsconfigTargets";
import type { ConfigResolver, FileLocation } from "#project/config/index";

export async function locateEnvironmentTsconfigs(
  config: ConfigResolver,
): Promise<FileLocation | undefined> {
  const targets = await listTsconfigTargets(config);

  const globs = targets
    .filter(({ key }) => key !== "base")
    .map(({ file }) => relativeWithin(config.context.root, file));

  return globs.length === 0 ? undefined : { globs };
}
