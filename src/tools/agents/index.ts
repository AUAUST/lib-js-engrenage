// @debt re-exports names moved to `metalbrain` so the `agents` entry and its consumers keep them; consumers should import them from their `metalbrain` domain
export {
  getRuleReferences,
  listReferenceFiles,
  listStaleSkillFiles,
  migrateBacklogIndex,
  migrateInstructionLocations,
  removeReferenceBlock,
  resolveAgentReference,
  syncFrontmatter,
} from "#metalbrain/instructions/index";
export {
  formatAgentCheck,
  hasPreferredAgents,
  readModelFacts,
  resolveHookDirectory,
  writeHookContext,
} from "#metalbrain/runtimes/index";
export { claudeSessionVariable } from "#tools/agents/claude/constants";
export {
  reconcileClaudeRuns,
  recordClaudeRun,
  resolveClaudeAgentTranscript,
} from "#tools/agents/claude/index";
export { agentShellVariables, mainAgent } from "#tools/agents/constants";
export { createDispatchEnvironment } from "#tools/agents/utils/createDispatchEnvironment";
export { findOutputOverrun } from "#tools/agents/utils/findOutputOverrun";
export { formatAgentAggregate } from "#tools/agents/utils/formatAgentAggregate";
export { formatAgentOutcomes } from "#tools/agents/utils/formatAgentOutcomes";
export { formatAgentRuns } from "#tools/agents/utils/formatAgentRuns";
export { renderAgentLimits } from "#tools/agents/utils/renderAgentLimits";
export type { GeneratedFrontmatter } from "#metalbrain/instructions/index";
export type {
  BudgetFinding,
  BudgetKind,
  BudgetMode,
  Budgets,
} from "#metalbrain/records/index";
export type {
  AgentDispatch,
  AgentGroupEntry,
  AgentOutcome,
  AgentRun,
  AgentRunState,
  AgentTask,
  Effort,
  Gate,
  HookDefinition,
  HookEvent,
  ResolvedAgents,
  SubagentCacheTtl,
} from "#metalbrain/runtimes/index";
export type { Agent } from "#metalbrain/runtimes/index";
export type { AgentDispatcher } from "#metalbrain/runtimes/ports/AgentDispatcher";
export type { AgentRuntime } from "#metalbrain/runtimes/ports/AgentRuntime";

// @barrel operations
export { addAgentRules } from "#tools/agents/operations/addAgentRules";
export { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
export { checkAgentHooks } from "#tools/agents/operations/checkAgentHooks";
export { checkAgentResume } from "#tools/agents/operations/checkAgentResume";
export { checkAgents } from "#tools/agents/operations/checkAgents";
export { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
export { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
export { findShellTrap } from "#tools/agents/operations/findShellTrap";
export { formatSkillBody } from "#tools/agents/operations/formatSkillBody";
export { getAgentRuntimes } from "#tools/agents/operations/getAgentRuntimes";
export { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
export { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
export { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
export { getSharedFiles } from "#tools/agents/operations/getSharedFiles";
export { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
export { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
export { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
export { listAgentSessions } from "#tools/agents/operations/listAgentSessions";
export { listFragmentOrigins } from "#tools/agents/operations/listFragmentOrigins";
export { listMissingExtensionRules } from "#tools/agents/operations/listMissingExtensionRules";
export { migrateSkillFiles } from "#tools/agents/operations/migrateSkillFiles";
export { readAgentRun } from "#tools/agents/operations/readAgentRun";
export { readAgentRuns } from "#tools/agents/operations/readAgentRuns";
export { readHookPayload } from "#tools/agents/operations/readHookPayload";
export { readRunningAgents } from "#tools/agents/operations/readRunningAgents";
export { removeCodexFiles } from "#tools/agents/operations/removeCodexFiles";
export { reportAgentChecks } from "#tools/agents/operations/reportAgentChecks";
export { reportBudgetFindings } from "#tools/agents/operations/reportBudgetFindings";
export { startAgentRun } from "#tools/agents/operations/startAgentRun";
export { syncHooks } from "#tools/agents/operations/syncHooks";
export { validateHookPayload } from "#tools/agents/operations/validateHookPayload";
export { writeAgentRun } from "#tools/agents/operations/writeAgentRun";
// @end

// @barrel ports
export type * from "#tools/agents/ports/AgentFiller";
export type * from "#tools/agents/ports/AgentRuleGenerator";
// @end

// @barrel config/schemas
export { skillSchema } from "#tools/agents/config/schemas/skillSchema";
// @end

// @barrel types
export type * from "#tools/agents/types/SkillDefinition";
// @end
