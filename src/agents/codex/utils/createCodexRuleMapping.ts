import { sort } from "@auaust/primitive-kit/arrays";

import { claudeRulesGlob } from "#agents/claude/constants";
import { parseInstruction } from "#agents/utils/parseInstruction";
import type { ResolvedConfig } from "#config/types/ResolvedConfig";

function cell(value: string): string {
  return `<code>${value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("|", "&#124;").replaceAll("\n", "&#10;").replaceAll("\r", "&#13;")}</code>`;
}

export function createCodexRuleMapping(config: ResolvedConfig): string {
  const rows: string[] = [];

  for (const file of config.filesystem.glob(claudeRulesGlob)) {
    const content = config.filesystem.read(file);

    if (content === undefined) {
      throw new Error(`Missing instruction file ${file}`);
    }

    const { paths } = parseInstruction(content, file);

    if (paths === undefined || paths.length === 0) {
      rows.push(`| All files | ${cell(file)} |`);
    } else {
      for (const glob of paths) {
        rows.push(`| ${cell(glob)} | ${cell(file)} |`);
      }
    }
  }

  sort(rows, (a, b) => a.localeCompare(b));

  return rows.length === 0
    ? "No project rule files are present."
    : ["| Matching glob | Rule to read |", "| --- | --- |", ...rows].join("\n");
}
