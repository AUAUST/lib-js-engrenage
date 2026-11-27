export interface OptionDeclaration<
  Name extends string = string,
  Value = unknown,
> {
  /**
   * The option's long flag without its dashes, keying its value.
   */
  readonly name: Name;
  readonly type: "boolean" | "string";
  readonly description?: string;
  readonly short?: string;
  readonly placeholder?: string;
  readonly default?: Value;
  readonly required: boolean;
  readonly multiple: boolean;
  readonly choices?: readonly string[];
  /**
   * The names of the options it cannot be used with.
   */
  readonly conflicts: readonly string[];
  /**
   * Reduces each value given to a string option, with its value so far.
   */
  parse?(value: string, previous: Value | undefined): Value;
}
