import type { apiGroups } from "#project/baseline/constants";

/**
 * An API group `src.apis` adds to a baseline source's tsconfig `types`, as
 * `@auaust/engrenage/apis/<group>`.
 */
export type ApiGroup = (typeof apiGroups)[number];
