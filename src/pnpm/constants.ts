import { freeze } from "@auaust/toolkit/object";

import { organization } from "#constants";
import type { WorkspaceSettings } from "#pnpm/types/WorkspaceSettings";
import type { File } from "#types/File";

export const workspaceFile = "pnpm-workspace.yaml" satisfies File;

export const workspaceSettings = freeze({
  allowBuilds: freeze({
    "unrs-resolver": true,
  } as const),
  minimumReleaseAgeExclude: freeze([`${organization}/*`] as const),
} as const) satisfies WorkspaceSettings;
