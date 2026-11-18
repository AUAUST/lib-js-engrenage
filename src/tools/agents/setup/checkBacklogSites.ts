import { posix } from "node:path";

import { backlogIndex } from "#tools/agents/constants";
import { hasPreferredAgents } from "#tools/agents/utils/hasPreferredAgents";
import { isBacklogEntryFile } from "#tools/agents/utils/isBacklogEntryFile";
import { throwViolations } from "#tools/agents/utils/throwViolations";
import type { LoadedConfig } from "#project/config/index";

const sitesBullet = /^- sites\b/;
const sitesForm = /^- sites: `[^`\s:]+:[1-9]\d*`(?:, `[^`\s:]+:[1-9]\d*`)*$/;
const sitePath = /`([^`\s:]+):[1-9]\d*`/g;

export async function checkBacklogSites(config: LoadedConfig): Promise<void> {
  const { filesystem } = config.context;

  if (!hasPreferredAgents(await config.resolve("agents"))) {
    return;
  }

  const files = await filesystem.glob(`${posix.dirname(backlogIndex)}/*.md`);

  const violations: string[] = [];

  for (const file of files.filter(isBacklogEntryFile)) {
    const content = await filesystem.read(file);

    if (content == null) {
      throw new Error(`${file}: listed by the backlog glob but unreadable`);
    }

    const lines = content.split("\n");

    for (const [index, line] of lines.entries()) {
      if (!sitesBullet.test(line)) {
        continue;
      }

      if (!sitesForm.test(line)) {
        violations.push(
          `${file}:${index + 1}: a sites bullet holds only \`file:line\` code spans joined by ", "`,
        );

        continue;
      }

      for (const [, path = ""] of line.matchAll(sitePath)) {
        if (!(await filesystem.exists(path))) {
          violations.push(
            `${file}:${index + 1}: site \`${path}\` names no file: write its path from the project root, or follow the file it moved to`,
          );
        }
      }
    }
  }

  throwViolations("Backlog sites bullets depart from their form:", violations);
}
