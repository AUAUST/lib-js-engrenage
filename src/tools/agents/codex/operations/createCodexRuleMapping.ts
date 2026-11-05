import { sort } from "@auaust/primitive-kit/arrays";

import { claudeRulesGlob } from "#tools/agents/claude/constants";
import { parseInstruction } from "#tools/agents/operations/parseInstruction";
import type { Filesystem } from "#foundation/filesystem/index";

function cell(value: string): string {
  return `<code>${value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("|", "&#124;").replaceAll("\n", "&#10;").replaceAll("\r", "&#13;")}</code>`;
}

export function createCodexRuleMapping({
  filesystem,
}: {
  filesystem: Filesystem;
}): string {
  const rows: string[] = [];

  for (const file of filesystem.glob(claudeRulesGlob)) {
    const content = filesystem.read(file);

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
