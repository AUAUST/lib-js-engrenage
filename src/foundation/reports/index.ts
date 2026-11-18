// @barrel ports
export type * from "#foundation/reports/ports/Reporter";
// @end

// @barrel types
export type * from "#foundation/reports/types/ReportData";
export type * from "#foundation/reports/types/ReportingContext";
// @end

// @barrel operations
export { createConsoleReporter } from "#foundation/reports/operations/createConsoleReporter";
// @end

// @barrel utils
export { formatReport } from "#foundation/reports/utils/formatReport";
// @end
