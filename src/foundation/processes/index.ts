// @barrel types/*.ts all
export * from "#foundation/processes/types/LockHolder";
export * from "#foundation/processes/types/ProcessResult";
// @end

// @barrel operations/*.ts named
export { resolveBinary } from "#foundation/processes/operations/resolveBinary";
export { runProcess } from "#foundation/processes/operations/runProcess";
export { spawnProcess } from "#foundation/processes/operations/spawnProcess";
export { withProcessLock } from "#foundation/processes/operations/withProcessLock";
// @end

// @barrel utils/*.ts named
export { ensureAnyOf } from "#foundation/processes/utils/ensureAnyOf";
export { ensureIncludes } from "#foundation/processes/utils/ensureIncludes";
export { ensureIncludesAll } from "#foundation/processes/utils/ensureIncludesAll";
export { ensureUnset } from "#foundation/processes/utils/ensureUnset";
export { getOptionsEnd } from "#foundation/processes/utils/getOptionsEnd";
export { hasOption } from "#foundation/processes/utils/hasOption";
export { isOptionOf } from "#foundation/processes/utils/isOptionOf";
// @end
