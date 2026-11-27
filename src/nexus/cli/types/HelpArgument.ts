/**
 * A positional argument as help states it: its usage text, such as `<ids...>`,
 * and each rule its values follow.
 */
export interface HelpArgument {
  readonly usage: string;
  readonly description?: string;
  readonly optional: boolean;
  readonly variadic: boolean;
  /**
   * The text splitting each value given into items.
   */
  readonly separator?: string;
  readonly choices?: readonly string[];
}
