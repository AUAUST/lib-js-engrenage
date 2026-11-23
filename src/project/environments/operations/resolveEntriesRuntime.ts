import { isDeepStrictEqual } from "node:util";

import { getOwn } from "@auaust/toolkit/object";

import { listNamespaceEnvironments } from "#project/environments/operations/listNamespaceEnvironments";
import type { Runtime } from "#project/baseline/index";
import type { ConfigResolver } from "#project/config/index";

/**
 * The runtime of the environments on the package entries, which the build targets;
 * `undefined` when none resolves one.
 *
 * @throws {Error} Those environments resolve several runtimes.
 */
export async function resolveEntriesRuntime(
  config: ConfigResolver,
): Promise<Runtime | undefined> {
  const [names, execution] = await Promise.all([
    listNamespaceEnvironments(config, (kind) => kind.entries === true),
    config.resolve("environments.execution"),
  ]);

  const runtimes = names.flatMap((name) => {
    const runtime = getOwn(execution, name)?.runtime;

    return runtime === undefined ? [] : { name, runtime };
  });

  const [first] = runtimes;

  const other = runtimes.find(({ runtime }) => {
    return !isDeepStrictEqual(runtime, first?.runtime);
  });

  if (first !== undefined && other !== undefined) {
    throw new Error(
      `The environments ${first.name} and ${other.name} on the package entries run different runtimes, so the build has no single target: tune their execution to one runtime`,
    );
  }

  return first?.runtime;
}
