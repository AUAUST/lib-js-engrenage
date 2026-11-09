import { freeze } from "@auaust/toolkit/object";

import type { File } from "#types/File";
import type { Globs } from "#types/Globs";

export const noInputsDiagnostic = 18_003;

export const defaultEnvFile = "env.d.ts" satisfies File;

export const defaultTypescriptFiles = freeze([
  "**/*.{ts,tsx}",
] as const) satisfies Globs;

export const defaultTsconfigInherits: Readonly<Record<string, string>> = freeze(
  {
    tooling: "scripts",
  },
);

export const unmanagedTsconfig = freeze({ enabled: false } as const);
