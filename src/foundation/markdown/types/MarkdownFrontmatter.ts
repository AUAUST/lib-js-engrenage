export type MarkdownFrontmatter =
  | { readonly kind: "none"; readonly body: string }
  | { readonly kind: "unclosed"; readonly body: string }
  | {
      readonly kind: "closed";
      readonly source: string;
      readonly yaml: string;
      readonly body: string;
    };
