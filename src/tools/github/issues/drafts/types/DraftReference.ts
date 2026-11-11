export type DraftReference =
  | {
      readonly kind: "issue";
      readonly short: string | undefined;
      readonly number: number;
    }
  | {
      readonly kind: "draft";
      readonly short: string | undefined;
      readonly stem: string;
    };
