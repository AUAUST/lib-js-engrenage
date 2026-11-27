import { argument, command } from "#nexus/cli/index";

export default command({
  name: "add",
  description: "Install a shared agent rule by name.",
  arguments: [
    argument({
      name: "name",
      description: "rule name, for example code-style",
    }),
  ],
  action() {
    return import("#bin/metalbrain/agents/rules/actions/add");
  },
});
