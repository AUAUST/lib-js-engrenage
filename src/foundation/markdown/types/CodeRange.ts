export interface CodeRange {
  readonly kind: "block" | "span";
  readonly start: number;
  readonly end: number;
}
