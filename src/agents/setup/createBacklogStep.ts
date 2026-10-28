import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

import {
  agentsFile,
  backlogIndex,
  backlogTemplate,
  legacyBacklog,
} from "#agents/constants";
import { addAgentRules } from "#agents/setup/addAgentRules";
import { syncAgentFiles } from "#agents/setup/syncAgentFiles";
import { getMissingRuleTemplates } from "#agents/utils/getMissingRuleTemplates";
import { engrenage } from "#constants";
import type { Filesystem } from "#config/types/Filesystem";
import type { Step } from "#support/scaffold/types/Step";

const sectionReference = `${engrenage}/agents/sections/backlog.md`;

function migrateBacklog(filesystem: Filesystem, content: string): string[] {
  const categories: string[] = [];

  const sections = content.split(/(?=^## )/m);

  for (const [index, section] of sections.entries()) {
    if (section.trim() === "") {
      continue;
    }

    const heading = /^## (.+)/.exec(section)?.[1];

    const title = heading?.replace(/^\d+\.\s*/, "") ?? "Imported context";

    const slug =
      title
        .toLowerCase()
        .replaceAll(/[^a-z0-9]+/g, "-")
        .replaceAll(/^-|-$/g, "") || "category";

    let file = `.ai/backlog/${slug}.md`;

    let suffix = index + 1;

    while (file === backlogIndex || filesystem.exists(file)) {
      file = `.ai/backlog/${slug}-${suffix++}.md`;
    }

    filesystem.write(file, section.trim() + "\n");

    categories.push(
      `- [${title}](${file.slice(".ai/backlog/".length)}): Imported ${title.toLowerCase()} entries; original numbering and context are preserved. Refine this scope when organizing the entries.`,
    );
  }

  return categories;
}

export function createBacklogStep(): Step {
  return {
    name: "shared backlog",
    message:
      "Set up the shared backlog in .ai/backlog/ (migrate any .claude/backlog.md)?",
    isMissing({ config, filesystem, getAgents }) {
      if ((getAgents()?.length ?? 0) === 0 || !filesystem.exists(agentsFile)) {
        return false;
      }

      return (
        !filesystem.exists(backlogIndex) ||
        filesystem.exists(legacyBacklog) ||
        !(filesystem.read(agentsFile)?.includes(sectionReference) ?? false) ||
        getMissingRuleTemplates(config).some(({ name }) => name === "backlog")
      );
    },
    plan({ config, filesystem }) {
      const legacy = filesystem.read(legacyBacklog);

      const template = readFileSync(
        createRequire(import.meta.url).resolve(backlogTemplate),
        "utf-8",
      );

      let index = filesystem.read(backlogIndex) ?? template;

      if (legacy !== undefined) {
        const categories = migrateBacklog(filesystem, legacy);

        if (categories.length > 0) {
          index = `${index.replace(/^No open categories yet\.\r?\n?/m, "").trimEnd()}\n\n${categories.join("\n")}\n`;
        }

        filesystem.remove(legacyBacklog);
      }

      if (!filesystem.exists(backlogIndex) || legacy !== undefined) {
        filesystem.write(backlogIndex, index);
      }

      const instructions = filesystem.read(agentsFile);

      if (instructions === undefined) {
        throw new Error(`Create ${agentsFile} before setting up the backlog`);
      }

      if (!instructions.includes(sectionReference)) {
        filesystem.write(
          agentsFile,
          `${instructions.trimEnd()}\n\n<!-- @reference ${sectionReference} -->\n<!-- @end -->\n`,
        );
      }

      addAgentRules(config, ["backlog"]);

      syncAgentFiles(config);
    },
  };
}
