import { argument, command } from "#nexus/cli/index";

export default command({
  name: "skills",
  description: "Select and install shared agent skills.",
  subcommands: [
    command({
      name: "add",
      description: "Install a shared agent skill by name.",
      arguments: [
        argument({
          name: "name",
          description: "skill name, for example planning",
        }),
      ],
      action() {
        return import("#bin/metalbrain/agents/skills/actions/add");
      },
    }),
  ],
  action() {
    return import("#bin/metalbrain/agents/skills/actions/add");
  },
});
