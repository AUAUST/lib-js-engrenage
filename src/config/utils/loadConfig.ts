import { configSchema } from "#config/config/schemas/configSchema";
import { packageFile } from "#config/constants";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { findConfigFile } from "#config/utils/findConfigFile";
import { importConfigFile } from "#config/utils/importConfigFile";
import { readPackageInfo } from "#config/utils/readPackageInfo";
import { readTsconfigInfo } from "#config/utils/readTsconfigInfo";
import { warnMissingConfig } from "#config/utils/warnMissingConfig";
import { resolve } from "#support/filesystem/utils/resolve";
import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import { validate } from "#support/validation/utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
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

  const packagePath = resolveWithin(root, packageFile);

  const tsconfigPath = resolveWithin(root, config.files.tsconfig);

  const gitignorePath = resolveWithin(root, config.files.gitignore);

  const tsconfig = readTsconfigInfo({
    root,
    tsconfig: config.files.tsconfig,
    tsconfigPath,
  });

  const generated =
    tsconfig.outDir === undefined
      ? config.files.generated
      : [...config.files.generated, `${tsconfig.outDir}/**`];

  return createResolvedConfig({
    root,
    config: {
      ...config,
      files: {
        ...config.files,
        generated,
      },
    },
    gitignorePath,
    package: readPackageInfo(packagePath),
    packagePath,
    tsconfig,
    tsconfigPath,
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
