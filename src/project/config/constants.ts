import { freeze } from "@auaust/toolkit/object";

import type { GlobalScope } from "#config/types/GlobalScope";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export const debugEnvironmentVariable = "ENGRENAGE_DEBUG";

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

export const defaultTypescriptFiles = freeze([
  "**/*.{ts,tsx}",
] as const) satisfies Globs;

export const defaultSourceDirectories = freeze([
  "src",
] as const) satisfies Directories;

export const defaultDataDirectories = freeze([
  "data",
] as const) satisfies Directories;

export const defaultTestsDirectories = freeze([
  "tests",
] as const) satisfies Directories;

export const defaultBinDirectories = freeze([
  "bin",
] as const) satisfies Directories;

export const defaultScriptsDirectories = freeze([
  "scripts",
] as const) satisfies Directories;

export const defaultToolingDirectories = freeze([
  ".",
] as const) satisfies Directories;

export const defaultToolingFiles = freeze([
  "*.config.ts",
  ".*.ts",
] as const) satisfies Globs;

export const defaultTestsLocation = "**/*" satisfies Glob;

export const defaultTestsSuffix = ".{spec,test}" satisfies Glob;

export const defaultTestsExtension = ".{ts,tsx}" satisfies Glob;

export const sourceTestsVariant = ".src";

export const distTestsVariant = ".dist";

export const defaultTestsFixtures = freeze([
  "**/fixtures/**",
] as const) satisfies Globs;

export const defaultTestsCoverageDirectory = "coverage" satisfies Directory;

export const defaultDefines = freeze({
  src: true,
  tests: true,
  bin: false,
  scripts: false,
} as const);

export const defaultInstructionFiles = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
  ".claude/skills/*/SKILL.md",
  ".claude/agents/*.md",
  ".agents/skills/*/SKILL.md",
] as const) satisfies Globs;

export const tsconfigEnvironments = freeze([
  "src",
  "tests",
  "bin",
  "scripts",
  "tooling",
] as const);

export const defaultTsconfigInherits = freeze({
  tooling: "scripts",
} as const);

export const unmanagedTsconfig = freeze({ enabled: false } as const);

export const disabledCodeEnvironment = freeze({
  dirs: [],
  generated: [],
  discovered: [],
  defines: false,
  tsconfig: unmanagedTsconfig,
} as const);

export const defaultTsconfigCheck = freeze({
  "src": true,
  "tests": true,
  "bin": true,
  "scripts": true,
  "tooling": true,
  "tests.dist": false,
} as const);
