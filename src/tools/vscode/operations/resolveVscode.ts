import { resolveSection } from "#foundation/options/utils/resolveSection";
import { vscodeSchema } from "#tools/vscode/config/schemas/vscodeSchema";
import type { ConfigContext } from "#project/config/types/ConfigContext";
import type { RawConfig } from "#project/config/types/RawConfig";
import type { ResolvedVscode } from "#tools/vscode/types/ResolvedVscode";

export function resolveVscode(
  raw: RawConfig,
  context: ConfigContext,
): ResolvedVscode {
  return resolveSection(vscodeSchema, raw.vscode, context, "vscode");
}
