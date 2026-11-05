import { resolveSection } from "#foundation/options/index";
import { vscodeSchema } from "#tools/vscode/config/schemas/vscodeSchema";
import type { RawConfig } from "#project/config/index";
import type { ResolvedVscode } from "#tools/vscode/types/ResolvedVscode";

export function resolveVscode(raw: RawConfig): ResolvedVscode {
  return resolveSection(vscodeSchema, raw.vscode, undefined, "vscode");
}
