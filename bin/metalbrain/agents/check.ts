import { command } from "#nexus/cli/index";

export default command({
  name: "check",
  description: "Check local agent integration without changing settings.",
  action() {
    return import("#bin/metalbrain/agents/actions/check");
  },
});
