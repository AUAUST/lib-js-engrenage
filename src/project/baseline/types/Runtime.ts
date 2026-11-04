import type { resolveBaselineMinimums } from "#baseline/utils/resolveBaselineMinimums";

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
