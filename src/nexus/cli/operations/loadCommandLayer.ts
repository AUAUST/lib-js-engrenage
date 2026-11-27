import { loadCommandFunction } from "#nexus/cli/operations/loadCommandFunction";
import type { CommandPath } from "#nexus/cli/types/CommandPath";
import type { LayerLoader } from "#nexus/cli/types/LayerLoader";

/**
 * Loads the `kind` layer of the `name` command at `path` through `loader`.
 *
 * @throws {TypeError} When `loader` loads no function.
 */
export async function loadCommandLayer<Value>(
  loader: LayerLoader<Value>,
  path: CommandPath,
  name: string,
  kind: string,
): Promise<Value> {
  const resolve = await loadCommandFunction(loader, name, kind);

  return resolve(path);
}
