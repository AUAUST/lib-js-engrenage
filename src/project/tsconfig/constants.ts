import { freeze } from "@auaust/toolkit/object";

import type { File } from "#types/File";

export const noInputsDiagnostic = 18_003;

export const environmentDeclarationsFile = "env.d.ts" satisfies File;

export const globalDeclarationsFile = "global.d.ts" satisfies File;

export const defaultTsconfigInherits: Readonly<
  Record<string, string>
> = freeze({
  tooling: "scripts",
});

export const unmanagedTsconfig = freeze({ enabled: false } as const);
