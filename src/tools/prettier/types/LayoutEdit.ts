export type LayoutEdit =
  | {
      kind: "blank-line";
      offset: number;
      present: boolean;
    }
  | {
      kind: "line-break";
      offset: number;
    }
  | {
      kind: "replace";
      start: number;
      end: number;
      text: string;
    };
