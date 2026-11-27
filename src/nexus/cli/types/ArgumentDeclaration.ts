import type { LayerLoader } from "#nexus/cli/types/LayerLoader";

export interface ArgumentDeclaration<
  Item = unknown,
  List extends boolean = boolean,
  Optional extends boolean = boolean,
> {
  readonly name: string;
  readonly description?: string;
  readonly optional: Optional;
  readonly variadic: boolean;
  /**
   * The text splitting each value given into items.
   */
  readonly separator?: string;
  /**
   * Whether its value lists its items: it is variadic or has a separator.
   */
  readonly list: List;
  readonly choices?: readonly string[] | LayerLoader<readonly string[]>;
  /**
   * Maps each item given.
   */
  parse?(item: string): Item;
}
