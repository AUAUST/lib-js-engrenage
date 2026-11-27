/**
 * A command passing every argument after its name, options and `--help` included,
 * to its action as they come; it takes no run options.
 */
export interface ForwardingCommandDeclaration {
  readonly kind: "forwarding";
  readonly name: string;
  readonly aliases: readonly string[];
  readonly description?: string;
  action(): Promise<unknown>;
}
