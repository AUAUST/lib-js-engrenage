export interface ExtensionShape<
  Owned extends object = object,
  Contributed extends object = object,
  Activation = unknown,
> {
  readonly name: string;
  readonly title?: string;
  readonly requires?: readonly string[];
  readonly when?: Activation;
  readonly owns?: Owned;
  readonly contributes?: Contributed;
}
