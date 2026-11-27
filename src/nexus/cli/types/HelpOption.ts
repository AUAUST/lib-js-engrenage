/**
 * An option as help states it: its flags as usage text writes them, such as
 * `-n, --note <text>`, and each rule its values follow.
 */
export interface HelpOption {
  readonly flags: string;
  readonly description?: string;
  readonly required: boolean;
  readonly multiple: boolean;
  /**
   * The default value, written as JSON.
   */
  readonly default?: string;
  readonly choices?: readonly string[];
  /**
   * The flags of the options it cannot be used with.
   */
  readonly conflicts: readonly string[];
}
