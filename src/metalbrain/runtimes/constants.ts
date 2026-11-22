import type { Agent } from "#metalbrain/runtimes/types/Agent";
import type { AgentTokens } from "#metalbrain/runtimes/types/AgentTokens";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export const metalbrainProgram = "metalbrain";

export const metalbrainProgramSource = `bin/${metalbrainProgram}/executable.ts` satisfies File;

// @debt restates the package name `#constants` owns, as importing it would load `@auaust/toolkit` into the hook
export const modelFactsSpecifier = "@auaust/engrenage/metalbrain/models.json";

export const statsDirectory = ".ai/stats" satisfies Directory;

export const mainAgent = "main";

export const callsExtension = ".calls.jsonl";

export const startsDirectory = "starts";

// @debt restates the package name `#constants` owns, as importing it would load `@auaust/toolkit` into the hook
export const budgetsSpecifier = "@auaust/engrenage/metalbrain/budgets.json";

// @debt restates the level names `data/metalbrain/budgets.json` › `levels` owns, so a level added there alone is dropped by `parseBudgets`
export const budgetLevels = ["scoped", "standard"] as const;

export const budgetExtension = ".budget.json";

export const claudeShellVariable = "CLAUDECODE";

export const agentShellVariables = {
  claude: claudeShellVariable,
} as const satisfies Partial<Record<Agent, string>>;

export const efforts = ["low", "medium", "high", "xhigh", "max"] as const;

export const subagentCacheTtls = ["5m", "1h"] as const;

export const hookEvents = [
  "PreToolUse",
  "PostToolUse",
  "Stop",
  "SubagentStart",
  "SubagentStop",
] as const;

export const tokenWeights = {
  input: 1,
  cacheRead: 0.1,
  cacheWrite5m: 1.25,
  cacheWrite1h: 2,
  output: 5,
} as const satisfies Record<keyof AgentTokens, number>;

export const agentRunExtensions = {
  recorded: ".json",
  running: ".running",
} as const;

export const agentOutcomes = [
  "completion",
  "budget",
  "scope",
  "linked",
  "blocked",
  "unreported",
] as const;
