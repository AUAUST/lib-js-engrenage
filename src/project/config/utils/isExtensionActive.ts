import { readConfigPath } from "#project/config/utils/readConfigPath";
import type { ConfigResolver } from "#project/config/types/ConfigResolver";
import type { Extension } from "#project/config/types/Extension";

export async function isExtensionActive(
  { when }: Extension,
  config: ConfigResolver,
): Promise<boolean> {
  if (when === undefined) {
    return true;
  }

  if ("config" in when) {
    return (await readConfigPath(config, when.config)) === true;
  }

  if (
    when.preset !== undefined &&
    (await config.input("preset")) !== when.preset
  ) {
    return false;
  }

  if (!("installed" in when)) {
    return true;
  }

  const dependencies = await config.resolve("dependencies");

  return dependencies.hasDependency(when.installed);
}
