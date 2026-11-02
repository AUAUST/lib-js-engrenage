import { syncCodexInstructions } from "#agents/codex/setup/syncCodexInstructions";
import { getMissingRuleTemplates } from "#agents/utils/getMissingRuleTemplates";
import { getRuleTemplates } from "#agents/utils/getRuleTemplates";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

export function addAgentRules(
  config: ResolvedConfig,
  names: readonly string[],
) {
  const templates = getRuleTemplates();

  for (const name of names) {
    if (!templates.some((template) => template.name === name)) {
      throw new Error(
        `Unknown agent rule "${name}". Available rules: ${templates.map((template) => template.name).join(", ")}`,
      );
    }
  }

  const missing = getMissingRuleTemplates(config);

  for (const { name, file, content } of missing) {
    if (names.includes(name)) {
      config.filesystem.write(file, content);
    }
  }

  syncCodexInstructions(config);
}
