import { command } from "#nexus/cli/index";

export default command({
  name: "debt",
  description: "List the @debt markers of the project.",
  action() {
    return import("#bin/metalbrain/actions/debt");
  },
});
