import { loadLazy } from "#foundation/modules/index";
import type { LoadedConfig } from "#project/config/index";
import type { Formatter } from "#project/format/ports/Formatter";

/**
 * The formatter `format.formatter` selects, or `undefined` when it is `false`.
 */
export async function loadFormatter(
  config: LoadedConfig,
): Promise<Formatter | undefined> {
  const selected = await config.resolve("format.formatter");

  return selected === false ? undefined : loadLazy(selected);
}
