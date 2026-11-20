// @debt restates `AgentTokens` of `tools/agents`, which importing would take the hook out of its domain; one of them should derive from the other
export interface MessageTokens {
  readonly input: number;
  readonly cacheWrite5m: number;
  readonly cacheWrite1h: number;
  readonly cacheRead: number;
  readonly output: number;
}
