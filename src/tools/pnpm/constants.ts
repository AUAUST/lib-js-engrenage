import { freeze } from "@auaust/toolkit/object";

import { lefthook, organization } from "#constants";
import type { WorkspaceSettings } from "#tools/pnpm/types/WorkspaceSettings";
import type { File } from "#types/File";

export const workspaceFile = "pnpm-workspace.yaml" satisfies File;

export const npmrcFile = ".npmrc" satisfies File;

export const lockfile = "pnpm-lock.yaml" satisfies File;

export const workspaceSettings = freeze({
  // @debt the pnpm domain lists the build policy of packages other domains install; the step or extension adding a package with a build script should declare its policy, so a new one cannot fail installs with ERR_PNPM_IGNORED_BUILDS
  allowBuilds: freeze({
    "esbuild": true,
    [lefthook]: false,
    "unrs-resolver": true,
  } as const),
  minimumReleaseAgeExclude: freeze([`${organization}/*`] as const),
} as const) satisfies WorkspaceSettings;

export const upgradeCommand = "engrenage pnpm upgrade";

export const onlyAllowScript = "npx only-allow pnpm";
