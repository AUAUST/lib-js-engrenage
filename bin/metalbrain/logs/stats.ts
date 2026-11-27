import { command } from "#nexus/cli/index";

export default command({
  name: "stats",
  description: "Count the entries per subject, flagging recurring subjects.",
  action() {
    return import("#bin/metalbrain/logs/actions/stats");
  },
  parse({ path }) {
    return [path.at(-2) ?? ""];
  },
});
