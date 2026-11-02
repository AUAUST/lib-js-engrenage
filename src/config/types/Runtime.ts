import type { resolveBaselineMinimums } from "#typescript/utils/resolveBaselineMinimums";

export type Runtime =
  | ({
      kind: "baseline";
      snapshot: string;
      library: string;
    } & ReturnType<typeof resolveBaselineMinimums>)
  | {
      kind: "node";
      major: number;
    };
