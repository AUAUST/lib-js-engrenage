import { freeze } from "@auaust/toolkit/object";

import { lefthook, organization } from "#constants";
import { stateDirectory } from "#project/config/constants";
import type { WorkspaceSettings } from "#tools/pnpm/types/WorkspaceSettings";
import type { Directory } from "#types/Directory";
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

// @debt observed from pnpm 12 runs, not from a documented list of what pnpm sets for the binaries it runs
export const pnpmRunVariables = freeze({
  prefixes: ["npm_", "pnpm_"],
  names: ["INIT_CWD", "PNPM_PACKAGE_NAME", "PNPM_SCRIPT_SRC_DIR"],
  binaries: ["node_modules", ".bin"],
} as const);

export const linksFile = `${stateDirectory}/links.json` satisfies File;

export const modulesDirectory = "node_modules" satisfies Directory;

export const linkedOutput = "dist" satisfies Directory;

export const linkedExecutables = `${linkedOutput}/bin` satisfies Directory;

export const restoreLinksCommand = "engrenage link --restore";
