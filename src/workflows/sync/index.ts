// @barrel operations/*.ts named
export { syncTargets } from "#workflows/sync/operations/syncTargets";
// @end

// @barrel utils/*.ts named
export { defineSyncTarget } from "#workflows/sync/utils/defineSyncTarget";
// @end

// @barrel types/*.ts all
export * from "#workflows/sync/types/SyncTarget";
export * from "#workflows/sync/types/SyncTargetName";
// @end
