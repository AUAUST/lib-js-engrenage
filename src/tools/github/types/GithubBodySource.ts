export type GithubBodySource =
  | { readonly kind: "text"; readonly text: string }
  | { readonly kind: "file"; readonly path: string }
  | { readonly kind: "unreadable" };
