import { rootScope } from "#batiment/scopes/constants";
import { listInstanceTsconfigs } from "#tools/typescript/operations/listInstanceTsconfigs";
import type { ConfigResolver } from "#project/config/index";
import type { File } from "#types/File";

/**
 * Splits the instance tsconfigs into the ones the base tsconfig references, which
 * `engrenage typecheck` checks, and a description of each instance it skips,
 * naming the environment, its scope outside the root, and why.
 */
export async function partitionInstanceTsconfigs(
  config: ConfigResolver,
): Promise<{
  checked: readonly File[];
  skipped: readonly string[];
}> {
  const checked: File[] = [];
  const skipped: string[] = [];

  for (const { instance, tsconfig, file } of await listInstanceTsconfigs(
    config,
  )) {
    if (tsconfig.check && file !== undefined) {
      checked.push(file);

      continue;
    }

    const name = instance.scope === rootScope
      ? instance.environment
      : `${instance.environment} in ${instance.scope}`;

    skipped.push(
      `${name} (${file === undefined ? "tsconfig disabled" : "check: false"})`,
    );
  }

  return {
    checked,
    skipped,
  };
}
