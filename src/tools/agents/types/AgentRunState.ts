import type { agentRunExtensions } from "#tools/agents/constants";

export type AgentRunState = keyof typeof agentRunExtensions;
