import type { Agent } from "#metalbrain/runtimes/types/Agent";
import type { AgentTokens } from "#metalbrain/runtimes/types/AgentTokens";
import type { HookDefinition } from "#metalbrain/runtimes/types/HookDefinition";
import type { Directory } from "#types/Directory";
import type { File } from "#types/File";

export {
  mainAgent,
  statsDirectory,
  thoroughnessExtension,
  thoroughnessLevels,
} from "#metalbrain/runtimes/hooks/constants";

export const metalbrainProgram = "metalbrain";

export const metalbrainProgramSource = `bin/${metalbrainProgram}/executable.ts` satisfies File;

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
  "thoroughness",
  "scope",
  "linked",
  "blocked",
  "unreported",
] as const;

export const unknownModel = "unknown";

export const standardTier = "standard";

export const fastTier = "fast";

export const claudeFile = "CLAUDE.md" satisfies File;

export const claudeSettingsFile = ".claude/settings.json" satisfies File;

export const claudeBinary = "claude";

export const claudeSessionVariable = "CLAUDE_CODE_SESSION_ID";

// @debt the kept names guess which `CLAUDE` variables a user configures, as Claude Code documents no split from those it sets for its own session and the processes it starts
export const claudeVariables = {
  prefix: "CLAUDE",
  kept: [
    "CLAUDE_CONFIG_DIR",
    "CLAUDE_CODE_OAUTH_TOKEN",
    "CLAUDE_CODE_USE_BEDROCK",
    "CLAUDE_CODE_USE_VERTEX",
    "CLAUDE_CODE_USE_FOUNDRY",
  ],
} as const;

// @debt the `engrenage-hook` and `engrenage agents` markers only clean settings synced before `metalbrain hook`; drop once consumers have synced past them
export const claudeHookMarkers = [
  "engrenage-hook claude ",
  `${metalbrainProgram} hook claude `,
  "engrenage agents claude hook ",
] as const;

export const metalbrainHook = {
  name: metalbrainProgram,
  source: metalbrainProgramSource,
} as const;

export const claudeHooks = [
  {
    event: "PreToolUse",
    matcher: "Bash|Agent|Task|SendMessage",
    args: "hook claude PreToolUse guardToolUse",
    program: metalbrainHook,
  },
  {
    event: "PostToolUse",
    matcher: "Bash",
    args: "hook claude PostToolUse limitOutput",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "PostToolUse",
    matcher: "Edit|MultiEdit|Write",
    args: "hook claude PostToolUse lintEdit",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "SubagentStart",
    matcher: "*",
    args: "hook claude SubagentStart",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "Stop",
    matcher: "*",
    args: "hook claude Stop",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "SubagentStop",
    matcher: "*",
    args: "hook claude SubagentStop",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "PreToolUse",
    matcher: "*",
    args: "hook claude PreToolUse",
    async: true,
    program: metalbrainHook,
  },
  {
    event: "PostToolUse",
    matcher: "*",
    args: "hook claude PostToolUse",
    async: true,
    program: metalbrainHook,
  },
] as const satisfies readonly HookDefinition[];

export const claudeStopHook = {
  args: "hook claude Stop gateStop",
  program: metalbrainHook,
} as const;

export const claudeThoroughnessHookArgs = "hook claude thoroughness --level";

// @debt permission entries are add-only: one engrenage stops producing stays in consumers' settings until sync records what it wrote (#229, #105)
// @debt the deny list names lefthook and engrenage's commit policy, which a host should contribute instead of metalbrain stating them
export const claudePermissions = {
  deny: [
    "Bash(git commit --no-verify*)",
    "Bash(git commit -n*)",
    "Bash(LEFTHOOK=0 *)",
    "Bash(LEFTHOOK=false *)",
    "Bash(git config core.hooksPath*)",
    "Bash(git push*)",
  ],
} as const;

export const claudeHiddenAttribution = {
  commit: "",
  pr: "",
  sessionUrl: false,
} as const;

export const claudeRulesGlob = ".claude/rules/**/*.md";

export const claudeSkillsDir = ".claude/skills" satisfies Directory;

export const claudeAgentsDir = ".claude/agents" satisfies Directory;

export const mainRole = "main";
