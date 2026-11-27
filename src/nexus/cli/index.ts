export { argument } from "#nexus/cli/operations/argument";
export { command } from "#nexus/cli/operations/command";
export { describeHelp } from "#nexus/cli/operations/describeHelp";
export { findRunContext } from "#nexus/cli/operations/findRunContext";
export { forwardingCommand } from "#nexus/cli/operations/forwardingCommand";
export { getRunContext } from "#nexus/cli/operations/getRunContext";
export { isDebugEnvironment } from "#nexus/cli/operations/isDebugEnvironment";
export { option } from "#nexus/cli/operations/option";
export { program } from "#nexus/cli/operations/program";
export { reportCommandError } from "#nexus/cli/operations/reportCommandError";
export { resolveInvocation } from "#nexus/cli/operations/resolveInvocation";
export { runInvocations } from "#nexus/cli/operations/runInvocations";
export { runProgram } from "#nexus/cli/operations/runProgram";

// @barrel errors
export { CommandUsageError } from "#nexus/cli/errors/CommandUsageError";
export { InvocationsError } from "#nexus/cli/errors/InvocationsError";
// @end

// @barrel utils
export { findSubcommand } from "#nexus/cli/utils/findSubcommand";
export { helpEntry } from "#nexus/cli/utils/helpEntry";
export { splitHelpFacts } from "#nexus/cli/utils/splitHelpFacts";
export { splitInvocations } from "#nexus/cli/utils/splitInvocations";
export { suggestName } from "#nexus/cli/utils/suggestName";
export { toDebugVariable } from "#nexus/cli/utils/toDebugVariable";
// @end

// @barrel types
export type * from "#nexus/cli/types/ArgumentDeclaration";
export type * from "#nexus/cli/types/CommandDeclaration";
export type * from "#nexus/cli/types/CommandInvocation";
export type * from "#nexus/cli/types/CommandPath";
export type * from "#nexus/cli/types/CommandTokens";
export type * from "#nexus/cli/types/DeclaredParameters";
export type * from "#nexus/cli/types/ForwardingCommandDeclaration";
export type * from "#nexus/cli/types/HelpArgument";
export type * from "#nexus/cli/types/HelpContract";
export type * from "#nexus/cli/types/HelpFacts";
export type * from "#nexus/cli/types/HelpListing";
export type * from "#nexus/cli/types/HelpMount";
export type * from "#nexus/cli/types/HelpOption";
export type * from "#nexus/cli/types/InvocationFailure";
export type * from "#nexus/cli/types/LayerLoader";
export type * from "#nexus/cli/types/OptionDeclaration";
export type * from "#nexus/cli/types/ParsingCommandDeclaration";
export type * from "#nexus/cli/types/ProgramDeclaration";
export type * from "#nexus/cli/types/Resolution";
export type * from "#nexus/cli/types/RunContext";
export type * from "#nexus/cli/types/RunFailure";
export type * from "#nexus/cli/types/RunOptionValues";
export type * from "#nexus/cli/types/RunResolution";
export type * from "#nexus/cli/types/RunSettings";
export type * from "#nexus/cli/types/VerbosityFlag";
// @end

export {
  completionEntry,
  createReporter,
  dataEntry,
  densePrinter,
  lineEntry,
  listEntry,
  readReportText,
  renderDenseEntry,
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
