/**
 * The Claude Code hook output of a hook failing open.
 */
export interface FailOpenOutput {
  readonly systemMessage: string;
  readonly hookSpecificOutput?: {
    readonly hookEventName: string;
    readonly additionalContext: string;
  };
}
