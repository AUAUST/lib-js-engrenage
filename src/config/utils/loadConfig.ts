import { configSchema } from "#config/config/schemas/configSchema";
import {
  defaultDistTsconfigFile,
  defaultGitignoreFile,
  defaultTsconfigFile,
  packageFile,
} from "#config/constants";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { findConfigFile } from "#config/utils/findConfigFile";
import { importConfigFile } from "#config/utils/importConfigFile";
import { resolveSourceFile } from "#config/utils/resolveSourceFile";
import { warnMissingConfig } from "#config/utils/warnMissingConfig";
import { resolve } from "#support/filesystem/utils/resolve";
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

  const raw = validate(configSchema, input, configFile ?? root);

  const tsconfigPath = resolveSourceFile({
    root,
    configured: raw.files?.tsconfig,
    fallback: defaultTsconfigFile,
  });

  const distTsconfigPath = resolveSourceFile({
    root,
    configured: raw.files?.distTsconfig,
    fallback: defaultDistTsconfigFile,
  });

  return createResolvedConfig({
    root,
    raw,
    packageJsonPath: resolveSourceFile({
      root,
      fallback: packageFile,
    }),
    tsconfigPath,
    distTsconfigPath: distTsconfigPath ?? tsconfigPath,
    gitignorePath: resolveSourceFile({
      root,
      configured: raw.files?.gitignore,
      fallback: defaultGitignoreFile,
    }),
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
