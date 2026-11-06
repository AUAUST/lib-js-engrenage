import { validate } from "#foundation/options/index";
import { readRawConfig, type LoadedConfig } from "#project/config/index";
import { configSchema } from "#workflows/registry/config/configSchema";
import { createConfig } from "#workflows/registry/operations/createConfig";
import type { Directory } from "#types/Directory";

export async function readConfig(
  start: Directory,
  options: { searchParents?: boolean } = {},
): Promise<LoadedConfig> {
  const { root, configFile, raw } = await readRawConfig(start, options);

  validate(configSchema.schema, raw, configFile ?? root);

  return createConfig({
    root,
    raw,
    configFile,
  });
}
