// @barrel types/*.ts all
export * from "#foundation/processes/types/LockHolder";
export * from "#foundation/processes/types/ProcessResult";
// @end

// @barrel operations/*.ts named
export { resolveBinary } from "#foundation/processes/operations/resolveBinary";
export { spawnProcess } from "#foundation/processes/operations/spawnProcess";
export { withProcessLock } from "#foundation/processes/operations/withProcessLock";
// @end
