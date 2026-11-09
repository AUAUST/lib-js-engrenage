export interface Resolver<
  Context = unknown,
  Sections extends object = Readonly<Record<string, unknown>>,
> {
  readonly context: Context;
  resolve<Key extends keyof Sections & string>(
    key: Key,
  ): Promise<Sections[Key]>;
}
