import { validate, type OptionContext } from "#foundation/options/index";
import { readRawConfig } from "#project/config/index";
import { configSchema } from "#workflows/registry/config/schemas/configSchema";
import { createConfig } from "#workflows/registry/operations/createConfig";
import type { Directory } from "#types/Directory";
import type { Config } from "#workflows/registry/types/Config";

export async function readConfig(
  start: Directory,
  options: { searchParents?: boolean } = {},
): Promise<OptionContext<Config>> {
  const { root, configFile, raw } = await readRawConfig(start, options);

  validate(configSchema, raw, configFile ?? root);

  return createConfig({
    root,
    raw,
    configFile,
  });
}
