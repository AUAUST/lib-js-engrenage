export { createProgram } from "#nexus/cli/operations/createProgram";
export { defineChainedCommand } from "#nexus/cli/operations/defineChainedCommand";
export { defineCommand } from "#nexus/cli/operations/defineCommand";
export { defineForwardingCommand } from "#nexus/cli/operations/defineForwardingCommand";
export { defineGroup } from "#nexus/cli/operations/defineGroup";
export { defineLazyCommand } from "#nexus/cli/operations/defineLazyCommand";
export { findRunContext } from "#nexus/cli/operations/findRunContext";
export { getRunContext } from "#nexus/cli/operations/getRunContext";
export { isDebugEnvironment } from "#nexus/cli/operations/isDebugEnvironment";
export { reportCommandError } from "#nexus/cli/operations/reportCommandError";
export { runInvocations } from "#nexus/cli/operations/runInvocations";
export { runProgram } from "#nexus/cli/operations/runProgram";

// @barrel errors
export { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
export { InvocationsError } from "#nexus/cli/errors/InvocationsError";
// @end

// @barrel utils
export { collectArgument } from "#nexus/cli/utils/collectArgument";
export { collectListArgument } from "#nexus/cli/utils/collectListArgument";
export { toUsageError } from "#nexus/cli/utils/toUsageError";
// @end

// @barrel types
export type * from "#nexus/cli/types/CommandDefinition";
export type * from "#nexus/cli/types/CommandParameters";
export type * from "#nexus/cli/types/DefaultActionParameters";
export type * from "#nexus/cli/types/ExtendCommand";
export type * from "#nexus/cli/types/InvocationFailure";
export type * from "#nexus/cli/types/RunContext";
export type * from "#nexus/cli/types/VerbosityFlag";
// @end

export {
  completionEntry,
  dataEntry,
  densePrinter,
  lineEntry,
  listEntry,
  stackEntry,
  styled,
  tableEntry,
  titleEntry,
  treeEntry,
} from "#nexus/reports/index";
export {
  detectPrinter,
  nexusDetectors,
  nexusScenarios,
} from "#nexus/scenarios/index";

export type {
  CompletionEntry,
  DataEntry,
  LineEntry,
  ListEntry,
  Printer,
  Report,
  ReportContent,
  ReportData,
  ReportEntry,
  Reporter,
  ReportKind,
  ReportSpan,
  ReportText,
  SpanStyle,
  StackEntry,
  StyledSpan,
  TableColumn,
  TableEntry,
  TableRow,
  TitleEntry,
  TreeEntry,
  TreeNode,
} from "#nexus/reports/index";
export type {
  PrinterLoader,
  ScenarioDetector,
  ScenarioPrinters,
} from "#nexus/scenarios/index";
