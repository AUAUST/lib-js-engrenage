import { freeze } from "@auaust/toolkit/object";

import type { Glob } from "#types/Glob";

export const buildMode = "build";

export const defaultCoverageProvider = "istanbul";

export const outDirGuard = "out-dir-guard";

export const sourceGuard = "source-guard";

export const pluginNames = freeze([outDirGuard, sourceGuard] as const);

export const vitestTestExtension = ".?(c|m)[jt]s?(x)" satisfies Glob;

export { project as pluginPrefix, vitest } from "#constants";
