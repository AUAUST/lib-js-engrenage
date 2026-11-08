import { defineGroup } from "#workflows/cli/index";
import { registerLazySubcommands } from "#workflows/cli/operations/registerLazySubcommands";

// @debt registers its subcommands through `registerLazySubcommands` in `configure` instead of naming them in `commands`, until its subcommands become definitions (#328)
export default defineGroup({
  configure(command) {
    return registerLazySubcommands(
      command.description("Integrate project tools with coding agents."),
      {
        check: {
          description:
            "Check local agent integration without changing settings.",
          async load() {
            const { check } = await import("#bin/engrenage/agents/check");

            return check;
          },
        },
        claude: {
          description: "Integrate the project tools with Claude Code.",
          async load() {
            const { claude } =
              await import("#bin/engrenage/agents/claude/index");

            return claude;
          },
        },
        codex: {
          description: "Integrate the project tools with Codex.",
          async load() {
            const { codex } = await import("#bin/engrenage/agents/codex/index");

            return codex;
          },
        },
        rules: {
          description: "Select and install shared agent rules.",
          async load() {
            const { rules } = await import("#bin/engrenage/agents/rules");

            return rules;
          },
        },
        skills: {
          description: "Select and install shared agent skills.",
          async load() {
            const { skills } = await import("#bin/engrenage/agents/skills");

            return skills;
          },
        },
      },
    );
  },
  commands: {},
});
