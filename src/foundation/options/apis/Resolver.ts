export interface Resolver<
  Context = unknown,
  Sections extends object = Readonly<Record<string, unknown>>,
> {
  /**
   * The context the resolver was created with, shared with every section it
   * resolves.
   */
  readonly context: Context;
  /**
   * The value the section of `key` resolves, computed once and reused until a
   * live section it read changes or `forget` drops it; a live section recomputes
   * on each read.
   *
   * @throws When `key` is unknown or refused, keys depend on each other in a
   * cycle, the input is invalid, or the section throws.
   */
  resolve<Key extends keyof Sections & string>(
    key: Key,
  ): Promise<Sections[Key]>;
  /**
   * The validated input of the section of `key`, with the input defaults applied;
   * `undefined` when the section reads no input.
   *
   * @throws When `key` is unknown or its input is invalid.
   */
  input(key: string): Promise<unknown>;
}
