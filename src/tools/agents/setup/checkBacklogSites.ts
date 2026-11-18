import { posix } from "node:path";

import { backlogIndex } from "#tools/agents/constants";
import { isBacklogEntryFile } from "#tools/agents/utils/isBacklogEntryFile";
import type { LoadedConfig } from "#project/config/index";

const sitesBullet = /^- sites\b/;
const sitesForm = /^- sites: `[^`\s:]+:[1-9]\d*`(?:, `[^`\s:]+:[1-9]\d*`)*$/;

export async function checkBacklogSites(config: LoadedConfig): Promise<void> {
  const { filesystem } = config.context;

  const files = await filesystem.glob(`${posix.dirname(backlogIndex)}/*.md`);

  const violations: string[] = [];

  for (const file of files.filter(isBacklogEntryFile)) {
    const content = await filesystem.read(file);

    if (content == null) {
      throw new Error(`${file}: listed by the backlog glob but unreadable`);
    }

    const lines = content.split("\n");

    for (const [index, line] of lines.entries()) {
      if (sitesBullet.test(line) && !sitesForm.test(line)) {
        violations.push(
          `${file}:${index + 1}: a sites bullet holds only \`file:line\` code spans joined by ", "`,
        );
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      [
        "Backlog sites bullets depart from their form:",
        ...violations.map((violation) => `- ${violation}`),
      ].join("\n"),
    );
  }
}
