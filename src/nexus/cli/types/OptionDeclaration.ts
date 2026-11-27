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
  /**
   * The text splitting each value given into items.
   */
  readonly separator?: string;
  /**
   * Whether its value lists its items: it is `multiple` or has a separator.
   */
  readonly list: boolean;
  readonly choices?: readonly string[];
  /**
   * The names of the options it cannot be used with.
   */
  readonly conflicts: readonly string[];
  // @debt the item `parse` returns is untyped, unlike an argument's: typing it needs `Value` split into item, list and presence as `ArgumentDeclaration` does
  /**
   * Maps each item given to a string option.
   */
  parse?(item: string): unknown;
}
