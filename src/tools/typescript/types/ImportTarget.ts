export type ImportTarget =
  | string
  | null
  | readonly ImportTarget[]
  | { readonly [condition: string]: ImportTarget };
