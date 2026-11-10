// @barrel operations/*.ts named
export { resolveSourceRuntime } from "#project/baseline/operations/resolveSourceRuntime";
// @end

// @barrel config/schemas/*.ts named
export { nodeMajorSchema } from "#project/baseline/config/schemas/nodeMajorSchema";
// @end

// @barrel utils/*.ts named
export { addMonths } from "#project/baseline/utils/addMonths";
export { assertBaselineSnapshot } from "#project/baseline/utils/assertBaselineSnapshot";
export { findCurrentMonth } from "#project/baseline/utils/findCurrentMonth";
export { includesEsLibrary } from "#project/baseline/utils/includesEsLibrary";
export { listEsSelections } from "#project/baseline/utils/listEsSelections";
export { qualifiesAtSnapshot } from "#project/baseline/utils/qualifiesAtSnapshot";
export { resolveBaselineMinimums } from "#project/baseline/utils/resolveBaselineMinimums";
export { resolveNodeRuntime } from "#project/baseline/utils/resolveNodeRuntime";
export { selectEsLibraries } from "#project/baseline/utils/selectEsLibraries";
// @end

// @barrel types/*.ts types
export type * from "#project/baseline/types/ApiGroup";
export type * from "#project/baseline/types/Runtime";
// @end
