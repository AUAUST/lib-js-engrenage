import { existsSync } from "node:fs";

import { map } from "@auaust/primitive-kit/arrays";
import { constant } from "@auaust/toolkit/constant";
import { memoized } from "@auaust/toolkit/memoized";
import { loadConfig as loadConfigFile, SUPPORTED_EXTENSIONS } from "c12";

import { configSchema } from "#config/config/schemas/configSchema";
import {
  configFileName,
  defaultDistTsconfigFile,
  defaultGitignoreFile,
  defaultTsconfigFile,
  packageFile,
} from "#config/constants";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import { resolve } from "#support/filesystem/utils/resolve";
import { resolveWithin } from "#support/filesystem/utils/resolveWithin";
import { validate } from "#utils/validate";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

const loadedConfigs = new Map<Directory, Promise<ResolvedConfig>>();

const warnMissingConfig = memoized(function (root: Directory) {
  console.warn(`No engrenage.config.ts found in ${root}, using defaults`);
}, constant(true));

function findConfigFile(root: Directory): File | null {
  const candidates = map(SUPPORTED_EXTENSIONS, (extension) => {
    return resolve(root, `${configFileName}${extension}`);
  });

  const [configFile = null, ...others] = candidates.filter((candidate) => {
    return existsSync(candidate);
  });

  if (others.length > 0) {
    throw new Error(
      `Found several engrenage config files in ${root}: ${[configFile, ...others].join(", ")}`,
    );
  }

  return configFile;
}

async function importConfigFile(
  root: Directory,
  configFile: File,
): Promise<unknown> {
  const { config } = await loadConfigFile({
    cwd: root,
    configFile,
    rcFile: false,
    globalRc: false,
    packageJson: false,
    dotenv: false,
    envName: false,
    extend: false,
    giget: false,
    configFileRequired: true,
  });

  return config;
}

function resolveSourceFile({
  root,
  configured,
  fallback,
}: {
  root: Directory;
  configured?: File | undefined;
  fallback: File;
}): File | undefined {
  if (configured === undefined) {
    const path = resolveWithin(root, fallback);

    return existsSync(path) ? path : undefined;
  }

  const path = resolveWithin(root, configured);

  if (!existsSync(path)) {
    throw new Error(`The configured ${configured} does not exist in ${root}`);
  }

  return path;
}

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

  const cached = loadedConfigs.get(root);

  if (cached !== undefined) {
    return cached;
  }

  const loaded = readConfig(root);

  loadedConfigs.set(root, loaded);

  loaded.catch(() => {
    loadedConfigs.delete(root);
  });

  return loaded;
}
