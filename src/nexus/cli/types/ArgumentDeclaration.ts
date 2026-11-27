import type { LayerLoader } from "#nexus/cli/types/LayerLoader";

export interface ArgumentDeclaration<Value = unknown> {
  readonly name: string;
  readonly description?: string;
  readonly optional: boolean;
  readonly variadic: boolean;
  readonly choices?: readonly string[] | LayerLoader<readonly string[]>;
  /**
   * Reduces each value given, with the argument's value so far.
   */
  parse(value: string, previous: Value | undefined): Value;
}
