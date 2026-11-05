// @debt the public `./baseline` entry exposes date and selection helpers (`addMonths`, `findCurrentMonth`, `listEsSelections`) as API, freezing internals that no consumer imports through the package name
export {
  addMonths,
  assertBaselineSnapshot,
  findCurrentMonth,
  includesEsLibrary,
  listEsSelections,
  qualifiesAtSnapshot,
  resolveBaselineMinimums,
  resolveNodeRuntime,
  selectEsLibraries,
} from "#project/baseline/index";
export type { ApiGroup, Runtime } from "#project/baseline/index";
