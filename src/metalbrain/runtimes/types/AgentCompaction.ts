export interface AgentCompaction {
  readonly at: string;
  readonly trigger: string;
  readonly before: number;
  readonly after: number;
}
