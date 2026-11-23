import type { apiGroups } from "#project/baseline/constants";

/**
 * An API group an environment's `execution.apis` adds to its baseline tsconfig
 * `types`, as `@auaust/engrenage/apis/<group>`.
 */
export type ApiGroup = (typeof apiGroups)[number];
