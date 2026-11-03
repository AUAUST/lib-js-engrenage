export type Default<Value, Context> =
  | { readonly value: Value }
  | {
      readonly explain: string;
      compute(context: Context): Value;
    };
