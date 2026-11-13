import type { resolveBaselineMinimums } from "#project/baseline/utils/resolveBaselineMinimums";

/**
 * The runtime a source targets: a `baseline` with its `YYYY-MM` snapshot,
 * the ES libraries `selectEsLibraries` picks for it and the minimums
 * `resolveBaselineMinimums` returns, or a `node` major.
 */
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
