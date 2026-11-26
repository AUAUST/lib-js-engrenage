import { defineChainedCommand } from "#nexus/cli/index";

export default defineChainedCommand({
  configure(command) {
    return command
      .description(
        "Move a backlog entry to another category, keeping its ID; deletes a category left empty.",
      )
      .argument("<id>", "the entry's ID")
      .argument("<category>", "an existing category's name");
  },
  action() {
    return import("#bin/metalbrain/backlog/actions/move");
  },
  parse(id, category) {
    return [id, category];
  },
});
