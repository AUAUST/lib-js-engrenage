export type ValueOrigin =
  | { readonly layer: "input" }
  | { readonly layer: "default"; readonly name: string }
  | { readonly layer: "declaration" };
