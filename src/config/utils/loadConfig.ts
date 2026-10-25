import { configSchema } from "#config/config/schemas/configSchema";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { findConfigFile } from "#config/utils/findConfigFile";
import { importConfigFile } from "#config/utils/importConfigFile";
import { readPackageInfo } from "#config/utils/readPackageInfo";
import { readTypescriptInfo } from "#config/utils/readTypescriptInfo";
import { warnMissingConfig } from "#config/utils/warnMissingConfig";
import { resolve } from "#support/filesystem/utils/resolve";
import { validate } from "#support/validation/utils/validate";
import type { Directory } from "#types/Directory";

const loadedConfigs = new Map<Directory, Promise<ResolvedConfig>>();

async function readConfig(root: Directory): Promise<ResolvedConfig> {
  const configFile = findConfigFile(root);

  if (configFile === null) {
    warnMissingConfig(root);
  }

  const input =
    configFile === null ? {} : await importConfigFile(root, configFile);

  const config = validate(configSchema, input, configFile ?? root);

  const typescript = readTypescriptInfo(root);

  const generated =
    typescript.outDir === undefined
      ? config.files.generated
      : [...config.files.generated, `${typescript.outDir}/**`];

  return createResolvedConfig({
    root,
    config: {
      ...config,
      files: {
        ...config.files,
        generated,
      },
    },
    package: readPackageInfo(root),
    typescript,
  });
}

export function loadConfig(
  cwd: Directory | URL = process.cwd(),
): Promise<ResolvedConfig> {
  const root = resolve(cwd);

  const loaded = loadedConfigs.get(root) ?? readConfig(root);

  loadedConfigs.set(root, loaded);

  return loaded;
}
