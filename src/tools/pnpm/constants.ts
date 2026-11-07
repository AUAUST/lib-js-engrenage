import { freeze } from "@auaust/toolkit/object";

import { organization } from "#constants";
import type { WorkspaceSettings } from "#tools/pnpm/types/WorkspaceSettings";
import type { File } from "#types/File";

export const workspaceFile = "pnpm-workspace.yaml" satisfies File;

export const npmrcFile = ".npmrc" satisfies File;

export const workspaceSettings = freeze({
  // @debt consumers running the lefthook init step hit ERR_PNPM_IGNORED_BUILDS until `lefthook: false` is listed here; init and workspace tests pin the exact entries
  allowBuilds: freeze({
    "esbuild": true,
    "unrs-resolver": true,
  } as const),
  minimumReleaseAgeExclude: freeze([`${organization}/*`] as const),
} as const) satisfies WorkspaceSettings;

export const upgradeCommand = "engrenage pnpm upgrade";

export const onlyAllowScript = "npx only-allow pnpm";
