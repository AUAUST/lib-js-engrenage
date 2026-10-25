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
import { loadConfig as loadConfigFile } from "c12";
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

  if (!existsSync(path)) {
    throw new Error(`Missing ${path}`);
  }

  return validate(packageSchema, JSON.parse(readFileSync(path, "utf8")), path);
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

async function readConfig(root: Directory): Promise<ResolvedConfig> {
  const { config: input, _configFile: configFile } = await loadConfigFile({
    name: "engrenage",
    cwd: root,
    rcFile: false,
    globalRc: false,
    packageJson: false,
    dotenv: false,
    envName: false,
    extend: false,
    giget: false,
    configFileRequired: false,
  });

  if (configFile === undefined) {
    warnMissingConfig(root);
  }

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
