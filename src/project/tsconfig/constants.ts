import { freeze } from "@auaust/toolkit/object";

import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export const noInputsDiagnostic = 18_003;

export const defaultEnvFile = "env.d.ts" satisfies File;

export const defaultTypescriptFiles = freeze([
  "**/*.{ts,tsx}",
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

export const defaultTsconfigCheck = freeze({
  "src": true,
  "tests": true,
  "bin": true,
  "scripts": true,
  "tooling": true,
  "tests.dist": false,
} as const);
