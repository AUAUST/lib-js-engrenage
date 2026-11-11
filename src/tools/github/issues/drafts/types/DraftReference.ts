export type DraftReference =
  | { readonly kind: "issue"; readonly number: number }
  | { readonly kind: "draft"; readonly stem: string }
  | {
      readonly kind: "registered";
      readonly repository: string;
      readonly target: string;
    };
