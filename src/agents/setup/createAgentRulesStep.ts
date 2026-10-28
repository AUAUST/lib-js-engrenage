import { readFileSync } from "node:fs";

import { syncAgentFiles } from "#agents/setup/syncAgentFiles";
import { getRuleTemplates } from "#agents/utils/getRuleTemplates";
import { parseInstruction } from "#agents/utils/parseInstruction";
import type { Step } from "#support/scaffold/types/Step";

export function createAgentRulesStep(): Step {
  return {
    name: "agent rules",
    message: "Create missing shared coding rules in .claude/rules/?",
    isMissing({ config, filesystem }) {
      return (
        (config.agents.preferred?.length ?? 0) > 0 &&
        getRuleTemplates().some(({ file }) => !filesystem.exists(file))
      );
    },
    plan({ config, filesystem }) {
      for (const { source, file, reference } of getRuleTemplates()) {
        if (filesystem.exists(file)) {
          continue;
        }

        const { frontmatter, body } = parseInstruction(
          readFileSync(source, "utf-8"),
          source,
        );

        filesystem.write(
          file,
          `${frontmatter}\n<!-- @reference ${reference} -->\n\n${body.trim()}\n\n<!-- @end -->\n`,
        );
      }

      syncAgentFiles(config);
    },
  };
}
