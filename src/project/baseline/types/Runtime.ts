import type { resolveBaselineMinimums } from "#project/baseline/utils/resolveBaselineMinimums";

export type Runtime =
  | ({
      kind: "baseline";
      snapshot: string;
      lib: readonly string[];
    } & ReturnType<typeof resolveBaselineMinimums>)
  | {
      kind: "node";
      major: number;
    };
