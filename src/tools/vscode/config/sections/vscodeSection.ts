import { declareSection } from "#foundation/options/index";
import { vscodeSchema } from "#tools/vscode/config/schemas/vscodeSchema";
import type { ResolvedVscode } from "#tools/vscode/types/ResolvedVscode";

export const vscodeSection = declareSection({
  declaration: vscodeSchema,
  resolve(input): ResolvedVscode {
    return vscodeSchema.resolve(input, undefined, "vscode");
  },
});
