export type Accessors<Fields> = {
  readonly [Field in keyof Fields]-?: NonNullable<Fields[Field]>;
} & {
  readonly optional: {
    readonly [Field in keyof Fields]-?: Fields[Field];
  };
};
