// @barrel operations/*.ts named
export { syncTargets } from "#sync/operations/syncTargets";
// @end

// @barrel utils/*.ts named
export { defineSyncTarget } from "#sync/utils/defineSyncTarget";
// @end

// @barrel types/*.ts all
export * from "#sync/types/SyncTarget";
export * from "#sync/types/SyncTargetName";
// @end
