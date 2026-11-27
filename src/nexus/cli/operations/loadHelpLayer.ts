import { join } from "@auaust/toolkit/array";

import { loadCommandLayer } from "#nexus/cli/operations/loadCommandLayer";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { LayerLoader } from "#nexus/cli/types/LayerLoader";

/**
 * Loads the `kind` layer of the `name` command at `path`, `program` its root's
 * name, through `loader`, recording its error in `failures` when it fails so one
 * failing layer hides no other fact of the help.
 *
 * @returns The layer, or `undefined` when it fails to load.
 * @effectful
 */
export async function loadHelpLayer<Value>(
  loader: LayerLoader<Value>,
  { path, program, name }: { path: CommandPath; program: string; name: string },
  kind: string,
  failures: unknown[],
): Promise<Value | undefined> {
  try {
    return await loadCommandLayer(loader, path, name, kind);
  } catch (error) {
    failures.push(
      new Error(
        `The ${kind} of '${join([program, ...path], " ")}' failed to load`,
        { cause: error },
      ),
    );
  }
}
