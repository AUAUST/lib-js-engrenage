import { freeze } from "@auaust/toolkit/object";

import type { Presets } from "#config/types/Presets";
import type { Directories } from "#types/Directories";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";
import type { Glob } from "#types/Glob";
import type { Globs } from "#types/Globs";

export const coverageDirectory: Directory = "coverage";

export const configFileName = "engrenage.config";

export const defaultCodeFiles: Glob = "**/*.{ts,tsx}";

export const defaultConfigFiles: Globs = freeze(["*.config.ts", ".*.ts"]);

export const defaultDiscoveredFiles: Globs = freeze([]);

export const defaultDistTsconfigFile: File = "tsconfig.dist.json";

export const defaultFixtureFiles: Glob = "**/fixtures/**";

export const defaultGeneratedFiles: Globs = freeze([]);

export const defaultGitignoreFile: File = ".gitignore";

export const defaultInstructionFiles: Globs = freeze([
  "AGENTS.md",
  ".claude/rules/**/*.md",
]);

export const defaultPresets: Presets = freeze([]);

export const defaultPrettierignoreFile: File = ".prettierignore";

export const defaultSourceDirectories: Directories = freeze(["src"]);

export const defaultTestDirectories: Directories = freeze(["tests"]);

export const defaultTestFiles: Glob = "**/*.{test,spec}.{ts,tsx}";

export const defaultTsconfigFile: File = "tsconfig.json";

export const packageFile: File = "package.json";

export const presets = freeze(["library"] as const);
