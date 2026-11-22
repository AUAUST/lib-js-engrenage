// @debt re-exports names moved to `metalbrain` so the `agents` entry and its consumers keep them; consumers should import them from their `metalbrain` domain
export { resolveAgentReference } from "#metalbrain/instructions/index";
export {
  formatAgentCheck,
  readModelFacts,
  resolveHookDirectory,
} from "#metalbrain/runtimes/index";
export { claudeSessionVariable } from "#tools/agents/claude/constants";
export {
  createClaudeSettingsStep,
  createClaudeStep,
  syncClaudeSettings,
} from "#tools/agents/claude/index";
export {
  reconcileClaudeRuns,
  recordClaudeRun,
  resolveClaudeAgentTranscript,
} from "#tools/agents/claude/index";
export { agentShellVariables, mainAgent } from "#tools/agents/constants";
export { filterAgents } from "#tools/agents/utils/filterAgents";
export { findOutputOverrun } from "#tools/agents/utils/findOutputOverrun";
export { formatAgentAggregate } from "#tools/agents/utils/formatAgentAggregate";
export { formatAgentOutcomes } from "#tools/agents/utils/formatAgentOutcomes";
export { formatAgentRuns } from "#tools/agents/utils/formatAgentRuns";
export type { GeneratedFrontmatter } from "#metalbrain/instructions/index";
export type { Agent } from "#metalbrain/runtimes/index";

// @barrel setup
export { checkBacklog } from "#tools/agents/setup/checkBacklog";
export { checkFragmentFiles } from "#tools/agents/setup/checkFragmentFiles";
export { checkTableCells } from "#tools/agents/setup/checkTableCells";
export { createAgentRulesStep } from "#tools/agents/setup/createAgentRulesStep";
export { createAgentsStep } from "#tools/agents/setup/createAgentsStep";
export { createBacklogStep } from "#tools/agents/setup/createBacklogStep";
export { createPreferredAgentsStep } from "#tools/agents/setup/createPreferredAgentsStep";
export { syncAgentFiles } from "#tools/agents/setup/syncAgentFiles";
export { syncAgents } from "#tools/agents/setup/syncAgents";
export { syncGeneratedRules } from "#tools/agents/setup/syncGeneratedRules";
// @end

// @barrel config/sections
export { agentsSection } from "#tools/agents/config/sections/agentsSection";
// @end

// @barrel operations
export { addAgentRules } from "#tools/agents/operations/addAgentRules";
export { addAgentSkills } from "#tools/agents/operations/addAgentSkills";
export { checkAgentDispatch } from "#tools/agents/operations/checkAgentDispatch";
export { checkAgentHooks } from "#tools/agents/operations/checkAgentHooks";
export { checkAgentResume } from "#tools/agents/operations/checkAgentResume";
export { checkAgents } from "#tools/agents/operations/checkAgents";
export { createAgentFillers } from "#tools/agents/operations/createAgentFillers";
export { createFragmentRenderer } from "#tools/agents/operations/createFragmentRenderer";
export { dispatchAgent } from "#tools/agents/operations/dispatchAgent";
export { fillAgentLimits } from "#tools/agents/operations/fillAgentLimits";
export { fillReferenceBlock } from "#tools/agents/operations/fillReferenceBlock";
export { findShellTrap } from "#tools/agents/operations/findShellTrap";
export { formatSkillBody } from "#tools/agents/operations/formatSkillBody";
export { getAgentRuntimes } from "#tools/agents/operations/getAgentRuntimes";
export { getInstructionTemplates } from "#tools/agents/operations/getInstructionTemplates";
export { getMissingRuleTemplates } from "#tools/agents/operations/getMissingRuleTemplates";
export { getRuleReferences } from "#tools/agents/operations/getRuleReferences";
export { getRuleTemplates } from "#tools/agents/operations/getRuleTemplates";
export { getSharedFiles } from "#tools/agents/operations/getSharedFiles";
export { getSkillDefinitions } from "#tools/agents/operations/getSkillDefinitions";
export { getSkillTemplates } from "#tools/agents/operations/getSkillTemplates";
export { listActiveExtensions } from "#tools/agents/operations/listActiveExtensions";
export { listAgentSessions } from "#tools/agents/operations/listAgentSessions";
export { listFragmentOrigins } from "#tools/agents/operations/listFragmentOrigins";
export { listLocalFilePatterns } from "#tools/agents/operations/listLocalFilePatterns";
export { listMissingExtensionRules } from "#tools/agents/operations/listMissingExtensionRules";
export { listReferenceFiles } from "#tools/agents/operations/listReferenceFiles";
export { listStaleSkillFiles } from "#tools/agents/operations/listStaleSkillFiles";
export { measureGithubCommand } from "#tools/agents/operations/measureGithubCommand";
export { migrateBacklogIndex } from "#tools/agents/operations/migrateBacklogIndex";
export { migrateInstructionLocations } from "#tools/agents/operations/migrateInstructionLocations";
export { migrateSkillFiles } from "#tools/agents/operations/migrateSkillFiles";
export { readAgentRun } from "#tools/agents/operations/readAgentRun";
export { readAgentRuns } from "#tools/agents/operations/readAgentRuns";
export { readHookPayload } from "#tools/agents/operations/readHookPayload";
export { readRunningAgents } from "#tools/agents/operations/readRunningAgents";
export { removeCodexFiles } from "#tools/agents/operations/removeCodexFiles";
export { removeReferenceBlock } from "#tools/agents/operations/removeReferenceBlock";
export { reportAgentChecks } from "#tools/agents/operations/reportAgentChecks";
export { reportBudgetFindings } from "#tools/agents/operations/reportBudgetFindings";
export { reportMissingExtensionRules } from "#tools/agents/operations/reportMissingExtensionRules";
export { reportSyncedAgentChecks } from "#tools/agents/operations/reportSyncedAgentChecks";
export { resolveAgentStatsDirectory } from "#tools/agents/operations/resolveAgentStatsDirectory";
export { startAgentRun } from "#tools/agents/operations/startAgentRun";
export { syncFrontmatter } from "#tools/agents/operations/syncFrontmatter";
export { syncHooks } from "#tools/agents/operations/syncHooks";
export { validateHookPayload } from "#tools/agents/operations/validateHookPayload";
export { writeAgentRun } from "#tools/agents/operations/writeAgentRun";
export { writeHookContext } from "#tools/agents/operations/writeHookContext";
// @end

// @barrel ports
export type * from "#tools/agents/ports/AgentDispatcher";
export type * from "#tools/agents/ports/AgentFiller";
export type * from "#tools/agents/ports/AgentRuleGenerator";
export type * from "#tools/agents/ports/AgentRuntime";
// @end

// @barrel config/schemas
export { agentsSchema } from "#tools/agents/config/schemas/agentsSchema";
export { budgetSchema } from "#tools/agents/config/schemas/budgetSchema";
export { preferredSchema } from "#tools/agents/config/schemas/preferredSchema";
export { skillSchema } from "#tools/agents/config/schemas/skillSchema";
// @end

// @barrel types
export type * from "#tools/agents/types/AgentDispatch";
export type * from "#tools/agents/types/AgentGroupEntry";
export type * from "#tools/agents/types/AgentOutcome";
export type * from "#tools/agents/types/AgentRun";
export type * from "#tools/agents/types/AgentRunState";
export type * from "#tools/agents/types/AgentSections";
export type * from "#tools/agents/types/AgentsInput";
export type * from "#tools/agents/types/AgentTask";
export type * from "#tools/agents/types/BudgetFinding";
export type * from "#tools/agents/types/BudgetKind";
export type * from "#tools/agents/types/BudgetMode";
export type * from "#tools/agents/types/Budgets";
export type * from "#tools/agents/types/Effort";
export type * from "#tools/agents/types/Gate";
export type * from "#tools/agents/types/HookDefinition";
export type * from "#tools/agents/types/HookEvent";
export type * from "#tools/agents/types/ResolvedAgents";
export type * from "#tools/agents/types/SkillDefinition";
export type * from "#tools/agents/types/SubagentCacheTtl";
// @end
