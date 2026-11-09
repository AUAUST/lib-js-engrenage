// @barrel operations/*.ts named
export { listScannedFiles } from "#tools/jscpd/operations/listScannedFiles";
export { reportClones } from "#tools/jscpd/operations/reportClones";
export { resolveJscpdArguments } from "#tools/jscpd/operations/resolveJscpdArguments";
export { warnClones } from "#tools/jscpd/operations/warnClones";
// @end

// @barrel setup/*.ts named
export { createJscpdStep } from "#tools/jscpd/setup/createJscpdStep";
// @end
