export type QueryLeaf =
  | {
      readonly kind: "term" | "phrase";
      readonly value: string;
      readonly field: string | undefined;
    }
  | {
      readonly kind: "regex";
      readonly value: string;
      readonly pattern: RegExp;
      readonly field: string | undefined;
    };
