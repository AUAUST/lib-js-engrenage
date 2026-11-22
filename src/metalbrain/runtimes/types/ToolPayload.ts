/**
 * The fields of a Claude Code tool hook payload the hook actions read.
 */
export interface ToolPayload {
  readonly session: string;
  readonly transcript: string;
  readonly agent?: string;
  readonly role?: string;
  readonly tool: string;
  readonly toolUse: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly response?: unknown;
}
