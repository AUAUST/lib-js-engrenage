import { command } from "#nexus/cli/index";

export default command({
  name: "fetch",
  description: "Write the labels of every registered repository and the issue types and fields of their organizations to the committed GitHub snapshot.",
  action() {
    return import("#bin/metalbrain/github/actions/fetch");
  },
});
