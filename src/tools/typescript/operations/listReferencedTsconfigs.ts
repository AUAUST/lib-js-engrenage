import { iterable } from "@auaust/toolkit";
import { toArray } from "@auaust/toolkit/array";

import { listInstanceTsconfigs } from "#tools/typescript/operations/listInstanceTsconfigs";
import type { ConfigResolver } from "#project/config/index";
import type { File } from "#types/File";

/**
 * Lists the instance tsconfigs the base tsconfig references, the ones
 * `engrenage typecheck` checks.
 */
export async function listReferencedTsconfigs(
  config: ConfigResolver,
): Promise<readonly File[]> {
  return toArray(
    iterable.filterMap(
      await listInstanceTsconfigs(config),
      ({ tsconfig, file }) => {
        return tsconfig.check ? file : undefined;
      },
    ),
  );
}
