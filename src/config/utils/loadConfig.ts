import { configSchema } from "#config/config/schemas/configSchema";
import { packageSchema } from "#config/config/schemas/packageSchema";
import type { PackageInfo } from "#config/types/PackageInfo";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";
import type { TypescriptInfo } from "#config/types/TypescriptInfo";
import { createResolvedConfig } from "#config/utils/createResolvedConfig";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import { readCompilerOptions } from "#typescript/utils/readCompilerOptions";
import { resolvePath } from "#utils/resolvePath";
import { resolveWithin } from "#utils/resolveWithin";
import { map } from "@auaust/primitive-kit/arrays";
import { loadConfig as loadConfigFile, SUPPORTED_EXTENSIONS } from "c12";
import { existsSync, readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import {
  safeParse,
  summarize,
  type GenericSchema,
  type InferOutput,
} from "valibot";

const loadedConfigs = new Map<Directory, Promise<ResolvedConfig>>();

let hasWarnedMissingConfig = false;

function validate<Schema extends GenericSchema>(
  schema: Schema,
  input: unknown,
  source: File,
): InferOutput<Schema> {
  const result = safeParse(schema, input);

  if (!result.success) {
    throw new Error(`Invalid ${source}:\n${summarize(result.issues)}`);
  }

  return result.output;
}

function readPackage(root: Directory): PackageInfo {
  const path = resolvePath(root, "package.json");

  const packageJson: unknown = existsSync(path)
    ? JSON.parse(readFileSync(path, "utf8"))
    : {};

  return validate(packageSchema, packageJson, path);
}

function toRootRelative(root: Directory, path: string): Directory {
  return relative(root, resolveWithin(root, path)).split(sep).join("/");
}

function readTypescript(root: Directory): TypescriptInfo {
  const path = resolvePath(root, "tsconfig.json");

  if (!existsSync(path)) {
    return {};
  }

  const { outDir, paths } = readCompilerOptions(path);

  return {
    outDir: outDir == null ? undefined : toRootRelative(root, outDir),
    paths,
  };
}

function warnMissingConfig(root: Directory) {
  if (hasWarnedMissingConfig) {
    return;
  }

  hasWarnedMissingConfig = true;

  console.warn(`No engrenage.config.ts found in ${root}, using defaults`);
}

function findConfigFile(root: Directory): File | null {
  const candidates = map(SUPPORTED_EXTENSIONS, (extension) => {
    return resolvePath(root, `engrenage.config${extension}`);
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

async function readConfigFile(
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

async function readConfig(root: Directory): Promise<ResolvedConfig> {
  const configFile = findConfigFile(root);

  if (configFile === null) {
    warnMissingConfig(root);
  }

  const input =
    configFile === null ? {} : await readConfigFile(root, configFile);

  const config = validate(configSchema, input, configFile ?? root);

  const typescript = readTypescript(root);

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
    package: readPackage(root),
    typescript,
  });
}

export function loadConfig(
  cwd: Directory | URL = process.cwd(),
): Promise<ResolvedConfig> {
  const root = resolvePath(cwd);

  const loaded = loadedConfigs.get(root) ?? readConfig(root);

  loadedConfigs.set(root, loaded);

  return loaded;
}
