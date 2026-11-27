import { argument, command } from "#nexus/cli/index";

export default command({
  name: "PreToolUse",
  description: "Store the start time of the tool call in Claude's PreToolUse payload from stdin, or with `guardToolUse`, deny it when the project's guards refuse it.",
  arguments: [
    argument({
      name: "check",
      description: "host check to run instead",
      optional: true,
      choices: ["guardToolUse"],
    }),
  ],
  action() {
    return import("#bin/metalbrain/hook/claude/actions/preToolUse");
  },
});
