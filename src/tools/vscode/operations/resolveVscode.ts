import { resolveSection } from "#foundation/options/index";
import { vscodeSchema } from "#tools/vscode/config/schemas/vscodeSchema";
import type { ConfigContext, RawConfig } from "#project/config/index";
import type { ResolvedVscode } from "#tools/vscode/types/ResolvedVscode";

export function resolveVscode(
  raw: RawConfig,
  context: ConfigContext,
): ResolvedVscode {
  return resolveSection(vscodeSchema, raw.vscode, context, "vscode");
}
