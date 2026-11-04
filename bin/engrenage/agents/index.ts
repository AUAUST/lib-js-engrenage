import { claude } from "#bin/engrenage/agents/claude/index";
import { codex } from "#bin/engrenage/agents/codex/index";
import { rules } from "#bin/engrenage/agents/rules";
import { skills } from "#bin/engrenage/agents/skills";
import { defineCommand } from "#cli/operations/defineCommand";
import { registerSubcommands } from "#cli/operations/registerSubcommands";

export const agents = defineCommand((command) => {
  return registerSubcommands(
    command.description("Integrate project tools with coding agents."),
    {
      claude,
      codex,
      rules,
      skills,
    },
  );
});
