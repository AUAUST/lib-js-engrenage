export type EdgeSort<Item> =
  | { readonly order: readonly Item[] }
  | { readonly cycle: readonly Item[] };
