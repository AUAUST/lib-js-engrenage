// @debt re-exports a name moved to `metalbrain/runtimes` so `tools/agents` keeps it; its consumers should import it from there
export { resolveClaudeAgentTranscript } from "#metalbrain/runtimes/index";

// @barrel setup
export { checkWordBudgets } from "#tools/agents/claude/setup/checkWordBudgets";
export { createClaudeSettingsStep } from "#tools/agents/claude/setup/createClaudeSettingsStep";
export { createClaudeStep } from "#tools/agents/claude/setup/createClaudeStep";
export { syncClaudeSettings } from "#tools/agents/claude/setup/syncClaudeSettings";
// @end

// @barrel operations
export { readClaudeAgentMeta } from "#tools/agents/claude/operations/readClaudeAgentMeta";
export { readClaudeTranscript } from "#tools/agents/claude/operations/readClaudeTranscript";
export { reconcileClaudeRuns } from "#tools/agents/claude/operations/reconcileClaudeRuns";
export { recordClaudeRun } from "#tools/agents/claude/operations/recordClaudeRun";
// @end
