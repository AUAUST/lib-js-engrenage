import { freeze } from "@auaust/toolkit/object";

import type { GlobalScope } from "#config/types/GlobalScope";
import type { Presets } from "#config/types/Presets";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export const defaultEmptyOutDir = true;

export const defaultSourcemap = true;

export const defaultDefineTypes = true;

export const defaultGlobalScope = "all" satisfies GlobalScope;

export const globalScopes = freeze(["all", "test", "build"] as const);

export const defaultEnvFile = "env.d.ts" satisfies File;

export const defaultCacheDirectory = "node_modules/.cache" satisfies Directory;

export const definitionKey = "~definition";

export const globalNamePattern =
  /^(?:import\.meta|[$A-Z_a-z][\w$]*)(?:\.[$A-Z_a-z][\w$]*)*$/;

export const defaultCoverageDirectory = "coverage" satisfies Directory;

export const defaultCodeFiles = "**/*.{ts,tsx}" satisfies Glob;

export const defaultConfigFiles = freeze([
  "*.config.ts",
  ".*.ts",
] as const) satisfies Globs;

export const defaultDiscoveredFiles = freeze([] as const) satisfies Globs;

export const defaultFixtureFiles = "**/fixtures/**" satisfies Glob;

export const defaultGeneratedFiles = freeze([] as const) satisfies Globs;

export const defaultInstructionFiles = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
] as const) satisfies Globs;

export const defaultPresets = freeze([] as const) satisfies Presets;

export const defaultSourceDirectories = freeze([
  "src",
] as const) satisfies Directories;

export const defaultBinDirectories = freeze([
  "bin",
] as const) satisfies Directories;

export const defaultScriptDirectories = freeze([
  "scripts",
] as const) satisfies Directories;

export const defaultTestDirectories = freeze([
  "tests",
] as const) satisfies Directories;

export const defaultTestFiles = "**/*.{test,spec}.{ts,tsx}" satisfies Glob;

export const presets = freeze(["library"] as const) satisfies Globs;
