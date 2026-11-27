/**
 * A subcommand its mount's check reports unavailable, its declaration
 * never loaded.
 */
export interface UnavailableCommand {
  readonly name: string;
  readonly aliases: readonly string[];
  readonly reason: string;
}
