/**
 * A commit message without its comment lines and the diff below the scissors
 * line; every line has its trailing whitespace removed.
 */
export interface CommitMessage {
  /**
   * The first non-empty line, or `""` for an empty message.
   */
  readonly subject: string;
  /**
   * The lines after the subject, without the blank lines around them.
   */
  readonly body: readonly string[];
}
