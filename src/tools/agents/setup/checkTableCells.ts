import { listTableCells } from "#foundation/markdown/index";
import { tableCellWords } from "#tools/agents/constants";
import { countWords } from "#tools/agents/utils/countWords";
import { hasPreferredAgents } from "#tools/agents/utils/hasPreferredAgents";
import { throwViolations } from "#tools/agents/utils/throwViolations";
import type { LoadedConfig } from "#project/config/index";

export async function checkTableCells(config: LoadedConfig): Promise<void> {
  const { filesystem } = config.context;

  const agents = await config.resolve("agents");

  if (!hasPreferredAgents(agents)) {
    return;
  }

  const violations: string[] = [];

  for (const file of await filesystem.glob(agents.instructionFiles)) {
    const content = await filesystem.read(file);

    if (content == null) {
      throw new Error(`${file}: listed by the instruction glob but unreadable`);
    }

    for (const { line, text } of listTableCells(content)) {
      const words = countWords(text);

      if (words > tableCellWords) {
        violations.push(
          `${file}:${line}: a table cell holds ${words} words, over ${tableCellWords}; shorten it or move its rows into a list`,
        );
      }
    }
  }

  throwViolations(
    `Instruction table cells exceed ${tableCellWords} words:`,
    violations,
  );
}
