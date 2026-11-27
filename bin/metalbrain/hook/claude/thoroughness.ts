import { command, option } from "#nexus/cli/index";

export default command({
  name: "thoroughness",
  description: "Warn the subagent in Claude's PreToolUse payload from stdin once its context outgrows the token limit of its thoroughness level.",
  options: [
    option({
      name: "level",
      type: "string",
      placeholder: "level",
      description: "thoroughness level of a brief naming no known Thoroughness: level",
      required: true,
    }),
  ],
  action() {
    return import("#bin/metalbrain/hook/claude/actions/thoroughness");
  },
});
