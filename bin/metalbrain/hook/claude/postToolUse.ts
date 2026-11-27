import { argument, command } from "#nexus/cli/index";

export default command({
  name: "PostToolUse",
  description: "Log the tool call in Claude's PostToolUse payload from stdin, with its duration, output size and cost; instead, with `limitOutput`, notice a shell output past the project's output limit, or with `lintEdit`, suggest the info lint messages of the edited file.",
  arguments: [
    argument({
      name: "check",
      description: "host check to run instead",
      optional: true,
      choices: ["limitOutput", "lintEdit"],
    }),
  ],
  action() {
    return import("#bin/metalbrain/hook/claude/actions/postToolUse");
  },
});
