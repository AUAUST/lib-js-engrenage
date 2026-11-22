// @debt restates `AgentTokens` with the same keys; one of them should derive from the other
export interface MessageTokens {
  readonly input: number;
  readonly cacheWrite5m: number;
  readonly cacheWrite1h: number;
  readonly cacheRead: number;
  readonly output: number;
}
